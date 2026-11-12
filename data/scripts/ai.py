import argparse
from email.utils import parsedate_to_datetime
import json
import logging
import math
from datetime import datetime, timezone
from pathlib import Path
import time
from typing import Any
from uuid import uuid4

import requests
from ai_token import OPENROUTER_API_KEY


API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "liquid/lfm-2.5-2.6b:free"
TEMPERATURE = 0.1
REQUEST_INTERVAL_SECONDS = 5
RETRY_MAX_BACKOFF_SECONDS = 300
SOURCE_QUESTIONS_DIR = (
    Path(__file__).resolve().parents[1] / "sources" / "enemSourceQuestions"
)
DATA_DIR = SOURCE_QUESTIONS_DIR.parent.parent
ENRICHED_QUESTIONS_PATH = DATA_DIR / "ai-enriched-questions.json"

SUBJECTS = (
    "arithmetic_and_fundamentals",
    "statistics_and_data_interpretation",
    "algebra_and_equations",
    "functions",
    "logarithms_and_exponentials",
    "trigonometry",
    "plane_geometry",
    "solid_and_analytic_geometry",
    "combinatorics_and_probability",
)

DIFFICULTIES = (1, 2, 3, 4)

SYSTEM_PROMPT = """\
You classify Brazilian ENEM mathematics questions.
Choose exactly one subject and one difficulty for the question.
Difficulty scale: 1 = easy_interpretative, 2 = medium, 3 = difficult_thinking, 4 = advanced_concepts.
Return exactly one JSON object with the keys "subject" and "difficulty".
The subject must be one of the allowed subject values, and difficulty must be
an integer from 1 to 4. Do not include markdown, explanations, or other keys.
"""

USER_PROMPT_TEMPLATE = """\
Classify this question using:
Allowed subjects: {subjects}
Allowed difficulties: {difficulties}

Title: {title}
Year: {year}
Context: {context}
Question command: {command}
Potential answers:
{alternatives}

Return only the requested JSON object.
"""

logger = logging.getLogger("ai")


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def initialize_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )


def read_enriched_questions() -> dict[str, Any]:
    if not ENRICHED_QUESTIONS_PATH.exists():
        return {"version": 1, "questions": []}
    registry = json.loads(ENRICHED_QUESTIONS_PATH.read_text(encoding="utf-8"))
    if (
        not isinstance(registry, dict)
        or registry.get("version") != 1
        or not isinstance(registry.get("questions"), list)
        or any(
            not isinstance(question, dict)
            or not isinstance(question.get("file"), str)
            for question in registry["questions"]
        )
    ):
        raise ValueError(f"Invalid AI enrichment registry: {ENRICHED_QUESTIONS_PATH}")
    return registry


def write_enriched_questions(registry: dict[str, Any]) -> None:
    temporary_path = ENRICHED_QUESTIONS_PATH.with_suffix(".json.tmp")
    temporary_path.write_text(
        json.dumps(registry, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(ENRICHED_QUESTIONS_PATH)


def register_enrichment(
    registry: dict[str, Any],
    question: dict[str, Any],
    file_path: Path,
    subject: str,
    difficulty: int,
    request_id: str,
) -> None:
    relative_path = file_path.relative_to(SOURCE_QUESTIONS_DIR).as_posix()
    entry = {
        "file": relative_path,
        "year": question["year"],
        "index": question["index"],
        "title": question["title"],
        "subject": subject,
        "difficulty": difficulty,
        "model": MODEL,
        "request_id": request_id,
        "enriched_at": utc_timestamp(),
    }
    questions = registry["questions"]
    for index, existing in enumerate(questions):
        if existing.get("file") == relative_path:
            questions[index] = entry
            break
    else:
        questions.append(entry)
    questions.sort(key=lambda item: item["file"])
    registry["updated_at"] = utc_timestamp()
    write_enriched_questions(registry)


def positive_int(value: str) -> int:
    maximum = int(value)
    if maximum < 1:
        raise argparse.ArgumentTypeError("must be at least 1")
    return maximum


def question_prompt(question: dict[str, Any]) -> str:
    alternatives = []
    for alternative in question["alternatives"]:
        text = alternative.get("text")
        file = alternative.get("file")
        details = text if text is not None else "[no text]"
        if file is not None:
            details += f" [image file: {file}; image content is not provided]"
        alternatives.append(f'{alternative["letter"]}: {details}')

    context = question.get("context") or "[none]"
    command = question.get("alternativesIntroduction") or "[none]"
    if question.get("files"):
        context += (
            "\n[Question image files: "
            + ", ".join(question["files"])
            + "; image content is not provided]"
        )

    return USER_PROMPT_TEMPLATE.format(
        subjects=", ".join(SUBJECTS),
        difficulties=", ".join(str(value) for value in DIFFICULTIES),
        title=question["title"],
        year=question["year"],
        context=context,
        command=command,
        alternatives="\n".join(alternatives),
    )


def rate_limit_retry_delay(
    response: requests.Response,
    error_detail: Any,
    retry_number: int,
) -> float:
    retry_after = response.headers.get("Retry-After")
    if retry_after is not None:
        try:
            delay = float(retry_after)
        except ValueError:
            try:
                retry_at = parsedate_to_datetime(retry_after)
            except (TypeError, ValueError, OverflowError):
                pass
            else:
                if retry_at.tzinfo is None:
                    retry_at = retry_at.replace(tzinfo=timezone.utc)
                delay = (retry_at - datetime.now(timezone.utc)).total_seconds()
                return max(float(REQUEST_INTERVAL_SECONDS), delay)
        else:
            if math.isfinite(delay):
                return max(float(REQUEST_INTERVAL_SECONDS), delay)

    if isinstance(error_detail, dict):
        error = error_detail.get("error")
        metadata = error.get("metadata") if isinstance(error, dict) else None
        if isinstance(metadata, dict):
            retry_after = metadata.get("retry_after_seconds")
            try:
                delay = float(retry_after)
            except (TypeError, ValueError):
                pass
            else:
                if math.isfinite(delay):
                    return max(float(REQUEST_INTERVAL_SECONDS), delay)

    return min(
        REQUEST_INTERVAL_SECONDS * 2 ** (retry_number - 1),
        RETRY_MAX_BACKOFF_SECONDS,
    )


def request_labels(
    question: dict[str, Any],
    file_path: Path,
) -> tuple[str, int, str]:
    request_id = str(uuid4())
    request_body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question_prompt(question)},
        ],
        "stream": True,
        "temperature": TEMPERATURE,
        "response_format": {"type": "json_object"},
    }
    question_path = file_path.relative_to(SOURCE_QUESTIONS_DIR).as_posix()
    logger.info(
        "Request %s started for %s (model=%s, temperature=%s)",
        request_id,
        question_path,
        MODEL,
        TEMPERATURE,
    )

    try:
        with requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json=request_body,
            timeout=60,
            stream=True,
        ) as response:
            logger.info(
                "Request %s received HTTP %s", request_id, response.status_code
            )
            if not response.ok:
                response_body = response.text
                try:
                    error_detail = response.json()
                except ValueError:
                    error_detail = response_body
                raise requests.HTTPError(
                    f"OpenRouter request failed with HTTP {response.status_code}: "
                    f"{error_detail}",
                    response=response,
                )

            content_parts = []
            finish_reason = None
            for raw_line in response.iter_lines():
                line = (
                    raw_line.decode("utf-8")
                    if isinstance(raw_line, bytes)
                    else raw_line
                )
                if not line or not line.startswith("data:"):
                    continue
                data = line.removeprefix("data:").strip()
                if data == "[DONE]":
                    break

                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError as error:
                    raise ValueError(
                        "OpenRouter returned an invalid stream chunk"
                    ) from error
                if "error" in chunk:
                    raise ValueError(f"OpenRouter stream error: {chunk['error']}")
                try:
                    choice = chunk["choices"][0]
                except (KeyError, IndexError, TypeError):
                    continue
                delta = choice.get("delta", {})
                text = delta.get("content")
                if isinstance(text, str):
                    content_parts.append(text)
                if choice.get("finish_reason") is not None:
                    finish_reason = choice["finish_reason"]

        content = "".join(content_parts).strip()
        if not content:
            raise ValueError(
                "OpenRouter stream contained no answer text "
                f"(finish_reason={finish_reason!r})"
            )

        try:
            labels = json.loads(content)
        except json.JSONDecodeError as error:
            raise ValueError("OpenRouter completion was not valid JSON") from error
        if (
            not isinstance(labels, dict)
            or set(labels) != {"subject", "difficulty"}
            or labels["subject"] not in SUBJECTS
            or type(labels["difficulty"]) is not int
            or labels["difficulty"] not in DIFFICULTIES
        ):
            raise ValueError(f"OpenRouter returned invalid question labels: {content!r}")
    except Exception as error:
        if isinstance(error, (requests.RequestException, ValueError)):
            logger.warning(
                "Request %s failed for %s: %s: %s",
                request_id,
                question_path,
                type(error).__name__,
                error,
            )
        else:
            logger.exception("Request %s failed for %s", request_id, question_path)
        raise

    logger.info(
        "Request %s succeeded for %s: subject=%s difficulty=%s",
        request_id,
        question_path,
        labels["subject"],
        labels["difficulty"],
    )
    return labels["subject"], labels["difficulty"], request_id


def request_labels_with_rate_limit_retry(
    question: dict[str, Any],
    file_path: Path,
) -> tuple[str, int, str]:
    retry_number = 0
    question_path = file_path.relative_to(SOURCE_QUESTIONS_DIR).as_posix()
    while True:
        try:
            return request_labels(question, file_path)
        except (requests.RequestException, ValueError) as error:
            response = getattr(error, "response", None)
            retry_number += 1
            error_detail: Any = None
            if response is not None:
                try:
                    error_detail = response.json()
                except ValueError:
                    error_detail = response.text
            retry_delay = (
                rate_limit_retry_delay(response, error_detail, retry_number)
                if response is not None
                else min(
                    REQUEST_INTERVAL_SECONDS * 2 ** (retry_number - 1),
                    RETRY_MAX_BACKOFF_SECONDS,
                )
            )
            logger.warning(
                "Request for %s failed (%s); retrying in %.2f seconds "
                "(retry %d, unlimited)",
                question_path,
                error,
                retry_delay,
                retry_number,
            )
            time.sleep(retry_delay)


def label_source_questions(max_requests: int) -> int:
    if not SOURCE_QUESTIONS_DIR.is_dir():
        raise FileNotFoundError(
            f"Source question directory not found: {SOURCE_QUESTIONS_DIR}"
        )

    registry = read_enriched_questions()
    requests_made = 0
    scanned = 0
    for file_path in sorted(SOURCE_QUESTIONS_DIR.glob(
        "[0-9][0-9][0-9][0-9]/questions/*/details.json"
    )):
        scanned += 1
        question = json.loads(file_path.read_text(encoding="utf-8"))
        if not isinstance(question, dict):
            raise ValueError(f"Expected a JSON object in {file_path}")
        if question.get("subject") is not None or question.get("difficulty") is not None:
            logger.info(
                "Skipping %s: subject=%r difficulty=%r (both must be null)",
                file_path.relative_to(SOURCE_QUESTIONS_DIR),
                question.get("subject"),
                question.get("difficulty"),
            )
            continue
        if requests_made >= max_requests:
            break

        subject, difficulty, request_id = request_labels_with_rate_limit_retry(
            question,
            file_path,
        )
        if requests_made + 1 < max_requests:
            time.sleep(REQUEST_INTERVAL_SECONDS)
        question["subject"] = subject
        question["difficulty"] = difficulty
        file_path.write_text(
            json.dumps(question, ensure_ascii=False, indent=4) + "\n",
            encoding="utf-8",
        )
        register_enrichment(
            registry,
            question,
            file_path,
            subject,
            difficulty,
            request_id,
        )
        requests_made += 1
        logger.info(
            "Saved labels for %s (%d/%d requests)",
            file_path.relative_to(SOURCE_QUESTIONS_DIR),
            requests_made,
            max_requests,
        )

    logger.info(
        "Scan complete: scanned=%d enriched_this_run=%d max_requests=%d "
        "registry_total=%d",
        scanned,
        requests_made,
        max_requests,
        len(registry["questions"]),
    )
    return requests_made


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fill null subject and difficulty labels on ENEM source questions."
    )
    parser.add_argument(
        "--max-requests",
        type=positive_int,
        required=True,
        help=(
            "maximum number of questions to label successfully; failed requests "
            "are retried until they succeed"
        ),
    )
    args = parser.parse_args()

    initialize_logging()
    try:
        requests_made = label_source_questions(args.max_requests)
    except Exception:
        logger.exception("Enrichment run failed")
        raise
    logger.info("Run completed successfully: %d request(s)", requests_made)


if __name__ == "__main__":
    main()
