# Refactor Handoff

## Current state

The npm workspaces migration is implemented for `data/` and `frontend/`.
`package.json` at the repository root is private and provides root commands for
development, package builds, combined build, tests, and linting. A root
`package-lock.json` is in use; the package-local lockfiles were removed.

Each package keeps its original identity, dependencies, and existing build
commands. Data tests use the existing `tsx` dependency and Node's test runner.
Frontend tests use Node's built-in test runner and TypeScript type stripping.
Root `npm test` runs both suites. `README.md` documents the commands, generated
data paths, and Node requirement.

The data pipeline writes generated question files and indexes to
`frontend/public/questions/` and `frontend/public/indexes/`. The frontend
consumes them from `/questions` and `/indexes`. Those generated public assets
remain ignored. `data/sources/` remains version-controlled; `data/temp/` and
`data/build.log` remain ignored.

## Validation completed

- Root `npm install` succeeded; audit reported zero vulnerabilities.
- `npm ls --workspaces` succeeded.
- `npm run test:data`: passed (1 test).
- `npm run test:frontend`: passed (2 tests).
- `npm test`: both workspace suites passed.
- `npm run lint`: passed for data TypeScript and frontend TypeScript/ESLint.
- `npm run build:frontend`: passed.
- The full data `build.ts` pipeline completed in a temporary project/output
  location, without clearing existing generated assets. It produced 642
  summaries and the index's referenced question file existed.
- Generated index and question assets were found in both `frontend/public/`
  and the frontend production output under `frontend/dist/`.

The Node runtime used was 22.23.2 with npm 10.9.8. Vite 8's installed engine
range is `^20.19.0 || ^22.12.0 || >=24`.

## Resume notes

- Do not run `npm run build` casually: the data build clears and recreates
  `data/temp/` and generated `frontend/public/` data. Use an isolated output
  location if another full-pipeline validation is needed.
- After old installs and lockfiles were removed, npm recreated
  `data/node_modules/` and `frontend/node_modules/` according to its root-lock
  install layout. There are no package-local lockfiles.
- At pause, HEAD was `2c8aeb9` (`wip`), containing the workspace implementation.
  Do not amend it. The observed worktree additionally showed the two old
  package-lockfiles deleted and the root lockfile updated.
- A final verification tool batch was interrupted by the pause request; its
  output was not collected. Recheck `git status` and the final artifact checks
  before making additional changes.
