import argparse
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = FRONTEND_ROOT / "src" / "public" / "official"
DEFAULT_OUTPUT_DIR = FRONTEND_ROOT / "src" / "api" / "generated"

MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]+\)")
ALTERNATIVE_LETTERS = {"A": "a", "B": "b", "C": "c", "D": "d", "E": "e"}


def _local_file_url(file_url: str, question_dir: Path, year: int, index: int) -> str:
    filename = Path(urlparse(file_url).path).name
    if not filename:
        raise ValueError(f"Asset URL has no filename: {file_url}")

    local_file = question_dir / filename
    if not local_file.is_file():
        raise FileNotFoundError(f"Asset referenced by question is missing: {local_file}")

    return f"/official/{year}/{index}/{filename}"


def _file_reference(
    file_url: str, question_dir: Path, year: int, index: int
) -> dict[str, str]:
    return {
        "url": _local_file_url(file_url, question_dir, year, index),
        "type": "image",
    }


def _build_problem(context: str | None, alternatives_introduction: str | None) -> str:
    sections = [
        MARKDOWN_IMAGE.sub("", section or "").strip()
        for section in (context, alternatives_introduction)
    ]
    return "\n\n".join(section for section in sections if section)


def convert_question(details: dict[str, Any], question_dir: Path) -> dict[str, Any]:
    year = int(details["year"])
    index = int(details["index"])
    source = f"enem {year}"
    correct_alternative = details["correctAlternative"]

    if correct_alternative not in ALTERNATIVE_LETTERS:
        raise ValueError(
            f"Invalid correct alternative for {year}-{index}: {correct_alternative!r}"
        )

    alternatives: list[dict[str, Any]] = []
    for alternative in details["alternatives"]:
        letter = alternative["letter"]
        if letter not in ALTERNATIVE_LETTERS:
            raise ValueError(f"Invalid alternative for {year}-{index}: {letter!r}")

        converted: dict[str, Any] = {
            "index": ALTERNATIVE_LETTERS[letter],
            "text": alternative.get("text") or "",
        }
        if alternative.get("file"):
            converted["file"] = _file_reference(
                alternative["file"], question_dir, year, index
            )
        alternatives.append(converted)

    if ALTERNATIVE_LETTERS[correct_alternative] not in {
        alternative["index"] for alternative in alternatives
    }:
        raise ValueError(f"Correct alternative is absent for {year}-{index}")

    files = [
        _file_reference(file_url, question_dir, year, index)
        for file_url in details.get("files", [])
    ]

    return {
        "id": f"{year}-{index}",
        "label": str(index),
        "title": details["title"],
        "source": source,
        "difficulty": None,
        "percentCorrectRate": None,
        "subject": None,
        "content": {
            "files": files,
            "problem": _build_problem(
                details.get("context"),
                details.get("alternativesIntroduction"),
            ),
            "alternatives": alternatives,
            "correctAlternative": ALTERNATIVE_LETTERS[correct_alternative],
            "explanation": "",
        },
    }


def build_dataset(source_dir: Path) -> list[dict[str, Any]]:
    details_paths = sorted(source_dir.glob("*/*/details.json"))
    if not details_paths:
        raise FileNotFoundError(f"No question details found under {source_dir}")

    questions: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for details_path in details_paths:
        question_dir = details_path.parent
        details = json.loads(details_path.read_text(encoding="utf-8"))
        question = convert_question(details, question_dir)

        expected_id = f"{question_dir.parent.name}-{question_dir.name}"
        if question["id"] != expected_id:
            raise ValueError(
                f"Question id in {details_path} does not match its directory "
                f"(expected {expected_id}, got {question['id']})"
            )
        if question["id"] in seen_ids:
            raise ValueError(f"Duplicate question id: {question['id']}")

        seen_ids.add(question["id"])
        questions.append(question)

    return questions


def build_indexes(questions: list[dict[str, Any]]) -> dict[str, Any]:
    by_id: dict[str, int] = {}
    by_source: dict[str, list[int]] = {}
    for position, question in enumerate(questions):
        question_id = question["id"]
        if question_id in by_id:
            raise ValueError(f"Duplicate question id: {question_id}")

        by_id[question_id] = position
        by_source.setdefault(question["source"], []).append(position)

    return {"byId": by_id, "bySource": by_source}


def _write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Flatten official question details and generate lookup indexes."
    )
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    questions = build_dataset(args.source_dir)
    indexes = build_indexes(questions)
    _write_json(args.output_dir / "questions.json", questions)
    _write_json(args.output_dir / "questions.index.json", indexes)
    print(f"Generated {len(questions)} questions in {args.output_dir}")


if __name__ == "__main__":
    main()
