import argparse
import json
from pathlib import Path
from typing import Any

import requests
from ai_token import OPENROUTER_API_KEY


API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "liquid/lfm-2.5-2.6b"
TEMPERATURE = 0.1
MAX_COMPLETION_TOKENS = 100
SOURCE_QUESTIONS_DIR = (
    Path(__file__).resolve().parents[1] / "sources" / "enemSourceQuestions"
)

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


def request_labels(question: dict[str, Any]) -> tuple[str, int]:
    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question_prompt(question)},
            ],
            "temperature": TEMPERATURE,
            "max_completion_tokens": MAX_COMPLETION_TOKENS,
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    response.raise_for_status()
    completion = response.json()
    try:
        content = completion["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise ValueError("OpenRouter response did not contain a completion") from error
    if not isinstance(content, str):
        raise ValueError("OpenRouter completion content was not text")

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

    return labels["subject"], labels["difficulty"]


def label_source_questions(max_requests: int) -> int:
    if not SOURCE_QUESTIONS_DIR.is_dir():
        raise FileNotFoundError(
            f"Source question directory not found: {SOURCE_QUESTIONS_DIR}"
        )

    requests_made = 0
    for file_path in sorted(SOURCE_QUESTIONS_DIR.glob(
        "[0-9][0-9][0-9][0-9]/questions/*/details.json"
    )):
        question = json.loads(file_path.read_text(encoding="utf-8"))
        if not isinstance(question, dict):
            raise ValueError(f"Expected a JSON object in {file_path}")
        if question.get("subject") is not None or question.get("difficulty") is not None:
            continue
        if requests_made >= max_requests:
            break

        subject, difficulty = request_labels(question)
        question["subject"] = subject
        question["difficulty"] = difficulty
        file_path.write_text(
            json.dumps(question, ensure_ascii=False, indent=4) + "\n",
            encoding="utf-8",
        )
        requests_made += 1
        print(f"Labeled {file_path.relative_to(SOURCE_QUESTIONS_DIR)}")

    return requests_made


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fill null subject and difficulty labels on ENEM source questions."
    )
    parser.add_argument(
        "--max-requests",
        type=positive_int,
        required=True,
        help="maximum number of OpenRouter requests to make",
    )
    args = parser.parse_args()

    requests_made = label_source_questions(args.max_requests)
    print(f"Completed {requests_made} OpenRouter request(s).")


if __name__ == "__main__":
    main()
