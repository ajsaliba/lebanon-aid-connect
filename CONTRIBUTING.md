# Contributing to World Monitor

Thank you for your interest in contributing to World Monitor! This project thrives on community contributions — whether it's code, data sources, documentation, or bug reports.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [AI-Assisted Development](#ai-assisted-development)
- [Coding Standards](#coding-standards)
- [Working with Sebuf (RPC Framework)](#working-with-sebuf-rpc-framework)
- [Adding Data Sources](#adding-data-sources)
- [Adding RSS Feeds](#adding-rss-feeds)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Code of Conduct](#code-of-conduct)

## Architecture Overview

Cedars Alert is a real-time crisis monitoring and humanitarian coordination platform built with **React + TypeScript**, **Vite**, **Supabase**, and map visualization components.

### Key Technologies

| Technology | Purpose |
|---|---|
| **TypeScript** | Primary language across frontend and edge functions |
| **React 18** | UI component model and app shell |
| **Vite** | Build tool and development server |
| **Supabase** | Auth, PostgreSQL, Realtime, Storage, and edge functions |
| **Leaflet / react-leaflet** | 2D map rendering and layer interactions |
| **globe.gl / Three.js** | Optional 3D globe visualizations |
| **TanStack Query** | Server-state fetching and caching |
| **Vitest + Testing Library** | Unit and component tests |
| **ESLint** | Static analysis and linting |

### Directory Structure

| Directory | Purpose |
|---|---|
| `src/components/` | UI components and feature panels |
| `src/features/` | Feature modules (map, operations shell, runtime prep) |
| `src/contexts/` | App context providers |
| `src/hooks/` | Reusable hooks |
| `src/lib/` | Shared utilities (bootstrap, i18n, ML helpers, etc.) |
| `src/test/` | Vitest tests |
| `supabase/functions/` | Supabase edge functions (Deno) |
| `supabase/migrations/` | Database migrations |
| `docs/` | Project documentation and notes |

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Cedars-Alert.git
   cd Cedars-Alert
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create `.env`** in the repository root:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   ```

## Development Setup

Run the standard local workflow:

```bash
npm run dev
```

Before opening a pull request, ensure these commands pass:

```bash
npm run lint
npm run test
npm run build
```

## How to Contribute

- Pick an issue or propose a new one before starting large changes.
- Keep changes focused and scoped to one concern.
- Add or update tests when behavior changes.
- Update docs when introducing new workflows, flags, or capabilities.
- Prefer small, reviewable pull requests over large refactors.

## Pull Request Process

1. Create a branch from the latest default branch.
2. Implement your change with clear commits.
3. Run lint, tests, and build locally.
4. Open a PR with:
   - concise summary,
   - rationale,
   - testing notes,
   - screenshots/GIFs for UI changes when relevant.
5. Address review feedback and keep CI green.

## AI-Assisted Development

AI assistance is welcome for drafting and iteration, but contributors remain accountable for correctness and security.

- Review all generated code and docs before submission.
- Verify behavior with tests and manual checks.
- Do not submit secrets, keys, or sensitive data.
- Disclose significant AI-assisted changes in PR notes when helpful for reviewers.

## Coding Standards

- Use **TypeScript** for type safety and readability.
- Follow existing project patterns for components, hooks, and contexts.
- Prefer clear naming and small reusable functions.
- Avoid `any` unless strongly justified.
- Keep formatting and lint output clean with repository ESLint rules.

## Working with Sebuf (RPC Framework)

The current Cedars Alert codebase does not use Sebuf; it uses Supabase APIs and edge functions instead.  
If RPC/proto-based integrations are added in the future, generated artifacts should be treated as build outputs and not edited manually.

## Adding Data Sources

When adding a new source:

- document purpose, trust level, and update frequency;
- normalize fields to existing article/event shape;
- include fallback/error handling for unavailable sources;
- ensure category/severity mapping is consistent;
- validate impact on UI panels and filters.

## Adding RSS Feeds

- Add feed metadata in the appropriate feed configuration location.
- Ensure deduplication and normalization logic remains stable.
- Confirm category mapping and severity heuristics are appropriate.
- Test with malformed/unavailable feeds to confirm graceful degradation.
- Include test coverage for parsing/normalization where practical.

## Reporting Bugs

Open a GitHub issue and include:

- expected behavior,
- actual behavior,
- reproduction steps,
- screenshots/logs (if applicable),
- browser/OS/environment details.

For security-sensitive bugs, use responsible disclosure and avoid posting exploit details publicly.

## Feature Requests

When proposing a feature, include:

- problem statement,
- proposed behavior,
- user impact,
- acceptance criteria,
- any constraints or dependencies.

Clear, scoped proposals are easier to prioritize and implement.

## Code of Conduct

Be respectful, constructive, and inclusive in all interactions.

- Assume good intent.
- Give actionable feedback.
- Avoid harassment, discrimination, and personal attacks.

By participating, you agree to collaborate in a professional and welcoming manner.
