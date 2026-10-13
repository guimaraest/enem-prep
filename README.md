# enem-prep

> this project was NOT vibecoded

repo for enem prep platform project

## Development

This repository uses npm workspaces for the data pipeline (`data/`) and frontend
(`frontend/`). Install dependencies once from the repository root with
`npm install`.

- `npm run dev` or `npm run dev:frontend` starts the Vite development server.
- `npm run build:data` builds question data from `data/sources/enem-api/`.
- `npm run build:frontend` creates the frontend production build.
- `npm run build` runs the data pipeline before the frontend build because the
  frontend serves generated data from `frontend/public/questions/` and
  `frontend/public/indexes/`.
- `npm run preview --workspace=enem-prep` previews the frontend production
  build; `npm run deploy --workspace=enem-prep` runs the existing Cloudflare
  Pages deployment command.

The generated `frontend/public/` assets, `frontend/dist/`, `data/temp/`, and
`data/build.log` remain ignored as before; source questions under
`data/sources/` are retained in version control. A full `npm run build:data`
recreates the generated public data.

## Tests and quality checks

- `npm run test:data` runs deterministic data-pipeline unit tests.
- `npm run test:frontend` runs frontend model tests.
- `npm test` runs both workspace test suites.
- `npm run lint` runs each workspace's configured TypeScript/ESLint checks.

Tests use Node's built-in test runner; data TypeScript tests are run through the
existing `tsx` dependency. The Vite 8 frontend requires Node.js
`^20.19.0 || ^22.12.0 || >=24`; use a compatible Node version for workspace
commands.
