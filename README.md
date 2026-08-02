# ExpensApp — Web Client

[![CI](https://github.com/manufabri91/expensapp-web/actions/workflows/ci-build-test.yml/badge.svg)](https://github.com/manufabri91/expensapp-web/actions/workflows/ci-build-test.yml)
[![codecov](https://codecov.io/gh/manufabri91/expensapp-web/branch/develop/graph/badge.svg)](https://codecov.io/gh/manufabri91/expensapp-web)

A personal expense/income tracker: multi-account, multi-currency balances, category/subcategory budgeting,
transfers between accounts, and recurring (scheduled) transactions — with charts and a bilingual (EN/ES) UI.

Live: **https://expensapp.manuelfabri.com**

![Logo](https://i.imgur.com/GkV5kWH.png)

### ⚠️ Disclaimer

Both the front-end (this repo) and the [back-end](https://github.com/manufabri91/expensapp-api) were built by one
person as a personal project. Some images used in the app/screenshots were sourced from the web and belong to
their original authors.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Internationalization](#internationalization)
- [Testing & Coverage](#testing--coverage)
- [Contributing](#contributing)
- [CI/CD](#cicd)
- [Screenshots](#screenshots)

## Tech Stack

| Concern              | Choice                                                                          |
| --------------------- | ---------------------------------------------------------------------------------- |
| Framework             | [Next.js 16](https://nextjs.org/docs/app) (App Router), React 19                  |
| Styling               | Tailwind CSS v4                                                                    |
| UI components         | [HeroUI](https://heroui.com) v3 (React Aria–based)                                |
| Data fetching (client) | [SWR](https://swr.vercel.app), backed by [Server Actions](https://nextjs.org/docs/app/api-reference/functions/server-actions) for mutations |
| Auth                  | Firebase Authentication (client) + [NextAuth.js v5](https://authjs.dev) (session/JWT layer) |
| i18n                  | [next-intl](https://next-intl.dev) — English, Spanish (Spain), Spanish (Argentina) |
| Charts                | Recharts                                                                           |
| Date handling         | date-fns                                                                           |
| Testing               | Jest 30 + React Testing Library                                                    |
| Coverage              | Jest (`lcov`) + Codecov (patch/project coverage checks)                            |
| CI                    | GitHub Actions                                                                     |
| Deployment            | Vercel (auto-deploy from GitHub, no custom workflow needed)                        |

## Project Structure

```
src/
├── app/                # App Router routes: (landing), auth/, dashboard/, transactions/, manage/, api/
│   └── api/             #   Next.js Route Handlers - thin pass-through proxies to the backend API
├── components/         # Shared, reusable UI components (Button, Money, TransactionForm, ...)
├── lib/
│   ├── actions/         #   Server Actions - the primary way pages/components talk to the backend
│   ├── api/             #   backendFetch/authenticatedBackendFetch - shared fetch wrappers with auth headers
│   ├── auth/            #   NextAuth.js config, session helpers
│   ├── providers/       #   React context providers (accounts, categories, transaction filters)
│   └── routes.ts        #   Public vs. protected route lists, used by proxy.ts
├── hooks/               # Shared React hooks
├── i18n/                # next-intl request config
├── types/               # Shared TypeScript types: dto/ (backend response shapes), enums/, viewModel/
├── utils/               # Small, pure, unit-tested helper functions
└── proxy.ts             # Route-protection middleware (redirects based on session state)
```

Each page under `src/app/` composes Server Components (data fetching via `lib/actions/*`) with client components
for interactivity. See [AGENTS.md](AGENTS.md) for the conventions behind each layer (component organization,
naming, testing) — that file is the source of truth for *how* to write code here; this README is about getting
the project running.

## Getting Started

### Prerequisites

- Node.js (Next.js 16 requires a recent LTS version) and npm.
- A running instance of [expensapp-api](https://github.com/manufabri91/expensapp-api) (locally via its own Docker
  Compose setup, or pointed at a deployed environment) — this app has no database of its own, everything goes
  through the backend.
- A Firebase project configured for email/password authentication (this app authenticates against Firebase
  client-side, then exchanges the resulting ID token with the backend — see [Authentication](#authentication)).

### 1. Clone the repository

```bash
git clone https://github.com/manufabri91/expensapp-web.git
cd expensapp-web
```

`develop` is the default/integration branch — branch your feature work from there.

### 2. Install dependencies

```bash
npm install
```

This also activates a Husky `pre-push` git hook (see [Testing & Coverage](#testing--coverage)) via the `prepare`
script — no separate setup step needed.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values described in [Environment Variables](#environment-variables) below.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable      | Description                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `API_URL`      | Base URL of the backend API (e.g. `http://localhost:8080` for a local `expensapp-api`). Read server-side only — never exposed to the browser, since all backend calls go through Server Actions/Route Handlers. |
| `AUTH_SECRET`  | Secret NextAuth.js uses to encrypt the session JWT. Any random string works locally (e.g. `openssl rand -base64 32`); must be a real secret in production. |

## Authentication

1. The browser authenticates directly against **Firebase** (email/password), which issues a Firebase ID token.
2. NextAuth's Credentials provider (`src/lib/auth/config.ts`) exchanges that token with the backend's `/auth`
   endpoints, receiving back the backend's own JWT.
3. NextAuth wraps the backend JWT inside its own encrypted session JWT (`AUTH_SECRET`) and stores it in a
   cookie. `src/lib/actions/*` and Route Handlers read `session.user.token` and forward it as the `Authorization`
   header on every backend request (see `backendFetch`/`authenticatedBackendFetch`).
4. `src/proxy.ts` is the route-protection layer: it redirects unauthenticated users away from protected routes
   (and authenticated users away from public ones like the sign-in page), and clears a session cookie that failed
   to refresh so it doesn't linger in a broken state.

## Internationalization

Powered by `next-intl`. Translation strings live in `messages/{en,es,es-AR}.json`, one namespace per feature area
(matching the component/page tree). When adding user-facing copy, add the key to **all three** locale files.

## Testing & Coverage

- Every new component ships with a unit test (Jest + React Testing Library), following Arrange-Act-Assert — see
  [AGENTS.md](AGENTS.md#testing-standards) for the full conventions.
- Run the full suite:

  ```bash
  npm test
  ```

- **Coverage is enforced via [Codecov](https://codecov.io), not a hand-maintained per-file list.** Two checks run
  on every PR (configured in `codecov.yml`):
  - **`patch`** — the lines you added/changed must be ≥80% covered.
  - **`project`** — total coverage must not regress from the base branch.

  This ratchets coverage upward over time as new code lands. `jest.config.ts` just emits the `lcov` report
  Codecov reads — it no longer fails the test run on a coverage shortfall itself.
- **A Husky `pre-push` git hook mirrors the `patch` check locally**, so a coverage regression is caught before you
  even open a PR: `.husky/pre-push` runs `scripts/check-diff-coverage.mjs`, which runs `jest --coverage`, diffs
  `src/` against `origin/develop`, and fails the push if the lines you added fall under 80% covered. Activated
  automatically by `npm install` (no separate step).

## Contributing

1. Branch off `develop` (the default branch) — `feature/…`, `fix/…`, or similar.
2. Follow the conventions in [AGENTS.md](AGENTS.md) (component organization, naming, testing, coverage). It's
   kept up to date as the actual source of truth for this codebase's style, not a generic template.
3. Open a PR against `develop`. CI runs the full test suite and Codecov reports patch/project coverage on the PR.

## CI/CD

A single GitHub Actions workflow, `ci-build-test.yml`, runs on every PR to `main`/`develop`: installs dependencies,
runs `jest --ci` with coverage, and uploads the report as a build artifact and to Codecov.

There's no custom deployment workflow — production deploys happen via **Vercel**'s own GitHub integration
(auto-deploy on push, with preview deployments per PR).

## Screenshots

![App Screenshot](https://i.imgur.com/eDAy5j3.png)
<img width="2171" height="1014" alt="Transactions page" src="https://github.com/user-attachments/assets/6efbf936-37b0-4121-8122-8dd880191fb8" />

## License

See [LICENSE](LICENSE) (MIT).
