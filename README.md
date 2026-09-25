# Cook & Bake Academy

[![GitHub Pages](https://img.shields.io/github/actions/workflow/status/cmlee75/codex-lab/pages.yml?branch=main&label=GitHub%20Pages)](https://github.com/cmlee75/codex-lab/actions/workflows/pages.yml)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/wasm)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20modules-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Live site](https://img.shields.io/badge/live%20site-GitHub%20Pages-222?logo=github)](https://cmlee75.github.io/codex-lab/)

A dependency-light, accessible catalogue for hands-on cooking and baking courses in Singapore. It includes course signup, a local SQLite FTS5 knowledge base, and an optional grounded ChatGPT mode for course questions.

## Live site

Visit [Cook & Bake Academy](https://cmlee75.github.io/codex-lab/).

## Overview

- Browse and filter 20 cooking and baking courses.
- Reserve a place with client-side validation and a local sign-up record.
- Search course brochures, policies, FAQs, and campus guidance with SQLite FTS5.
- Ask the course assistant in extractive search mode, or enable ChatGPT mode with an API key held only in the current browser session.
- Build and evaluate the knowledge base before GitHub Pages deployment.

## Architecture

```text
Browser
├── index.html + styles.css       Page shell, accessible dialogs, responsive layout
├── app.js                        Course catalogue and sign-up flow
├── js/chat.js                    Assistant UI, SQLite WASM loader, optional Responses API mode
├── js/rag.js                     Safe FTS query construction, retrieval, and structured price answers
└── data/academy.db               Exported SQLite database with FTS5 chunks + courses table

Build and quality gates
├── scripts/build-kb.mjs          Markdown/course JSON → academy.db using official SQLite WASM
├── scripts/eval.mjs              Golden-question retrieval evaluation
└── .github/workflows/pages.yml   Build, evaluate, then deploy GitHub Pages
```

The browser retrieves only the top three knowledge-base chunks. In ChatGPT mode, those chunks are sent as numbered sources with grounded instructions; no-answer results never call the API. The API key is never committed or placed in `localStorage`.

## Installation

### Prerequisites

- Node.js 22 or later
- Python 3 (for the optional local static server)

### Run locally

```bash
git clone https://github.com/cmlee75/codex-lab.git
cd codex-lab
npm ci
npm run build:kb
npm run eval
python -m http.server 8000
```

Open <http://localhost:8000/>. Serving over HTTP is required because the site fetches course data and the SQLite database.

## Quality checks

```bash
npm run build:kb  # Regenerates data/academy.db from kb/ and data/courses.json
npm run eval      # Runs the 30-question retrieval gate
```

The Pages workflow runs both checks before publishing. A failed knowledge-base evaluation prevents deployment.

## ChatGPT mode

Open **Ask a question** → **Settings**, enter an OpenAI API key, and choose a model (default: `gpt-6-luna`). The key is retained only in browser `sessionStorage`, so it disappears when the browser session ends. If the API cannot answer or returns an error, the assistant uses its local search result instead.

## Security

- No API keys, secrets, or `.env` files are committed.
- The assistant treats questions as data and grounds model calls in retrieved sources.
- GitHub Pages deploys only after the build and evaluation steps succeed.

## Support

For course help, email [hello@cookandbake.academy](mailto:hello@cookandbake.academy).
