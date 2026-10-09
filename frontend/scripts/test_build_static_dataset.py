import json
import tempfile
import unittest
from pathlib import Path

from build_static_dataset import build_dataset, build_indexes


class BuildStaticDatasetTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.source_dir = Path(self.temp_dir.name) / "official"
        self.question_dir = self.source_dir / "2023" / "136"
        self.question_dir.mkdir(parents=True)
        (self.question_dir / "figure.png").write_bytes(b"image")
        details = {
            "title": "Questão 136 - ENEM 2023",
            "index": 136,
            "year": 2023,
            "context": (
                "Enunciado com imagem "
                "![](https://enem.dev/2023/questions/136/figure.png)"
            ),
            "files": ["https://enem.dev/2023/questions/136/figure.png"],
            "correctAlternative": "B",
            "alternativesIntroduction": "Qual é a resposta?",
            "alternatives": [
                {"letter": "A", "text": None, "file": None},
                {
                    "letter": "B",
                    "text": None,
                    "file": "https://enem.dev/2023/questions/136/figure.png",
                },
            ],
        }
        (self.question_dir / "details.json").write_text(
            json.dumps(details), encoding="utf-8"
        )

    def test_flattens_prompt_and_uses_current_question_shape(self) -> None:
        question = build_dataset(self.source_dir)[0]

        self.assertEqual(question["id"], "2023-136")
        self.assertEqual(question["source"], "enem 2023")
        self.assertIsNone(question["difficulty"])
        self.assertIsNone(question["percentCorrectRate"])
        self.assertIsNone(question["subject"])
        self.assertEqual(
            question["content"]["problem"],
            "Enunciado com imagem\n\nQual é a resposta?",
        )
        self.assertEqual(question["content"]["alternatives"][1]["text"], "")
        self.assertEqual(
            question["content"]["alternatives"][1]["file"]["url"],
            "/official/2023/136/figure.png",
        )
        self.assertEqual(
            question["content"]["correctAlternative"],
            "b",
        )

    def test_builds_id_and_source_indexes(self) -> None:
        questions = build_dataset(self.source_dir)

        self.assertEqual(
            build_indexes(questions),
            {
                "byId": {"2023-136": 0},
                "bySource": {"enem 2023": [0]},
            },
        )

    def test_fails_when_a_referenced_asset_is_missing(self) -> None:
        (self.question_dir / "figure.png").unlink()

        with self.assertRaises(FileNotFoundError):
            build_dataset(self.source_dir)


if __name__ == "__main__":
    unittest.main()
