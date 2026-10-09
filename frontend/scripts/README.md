# Static question dataset

Run `python frontend/scripts/build_static_dataset.py` from the repository root to
read the official per-question JSON files under `frontend/src/public/official`
and write:

- `frontend/src/api/generated/questions.json`: questions flattened to the
  frontend `Question` shape.
- `frontend/src/api/generated/questions.index.json`: array-position indexes by
  question ID and source.

The question `problem` combines the source `context` and
`alternativesIntroduction` (the ENEM enunciado). Referenced media files are
validated and their URLs are normalized to `/official/<year>/<number>/<file>`.
The source does not provide topic-level subject, difficulty, performance rate,
or explanation, so those fields are emitted as `null` or an empty string.

Use `--source-dir` and `--output-dir` to process another source tree or write
artifacts elsewhere. Run the focused tests with
`python -m unittest discover -s frontend/scripts -p 'test_*.py'`.
