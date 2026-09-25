---
name: project-setup
description: Use when setting up the Cook & Bake site on a new machine or
  after a fresh clone — installs dependencies, vendors SQLite WASM, builds
  the knowledge base and runs the assistant's evaluation.
---

# project-setup

## Steps
1. Check `node --version` is 20 or later; stop and report if not.
2. Run `npm install`.
3. Run `npm run vendor`.
4. Run `npm run check` and report the eval line.
5. Tell the user to run `npm run serve` and open http://localhost:8080.

## Never
- Never run `npm audit fix --force`.
- Never write outside this project folder.
