---
description: Audit, test, and publish Cook & Bake Academy to GitHub Pages.
---

Prepare and publish the current project safely.

1. Inspect `git status`, the current branch, and the `origin` remote. Do not overwrite unrelated user changes.
2. Run a credential scan over source files. Stop and report any actual API key, token, password, private key, or `.env` file that would be committed. Do not stage or push a suspected secret.
3. Run `npm ci`, `npm run build:kb`, and `npm run eval`. Stop if the evaluator is not 30/30.
4. Confirm `.gitignore` excludes `node_modules/`, `.sites-runtime/`, and `.env*` (while permitting `.env.example`).
5. Review the GitHub Pages workflow. It must build the knowledge base and run evaluation before deployment.
6. Stage only intended application, knowledge-base, build, documentation, workflow, and command files. Never stage `node_modules/`, `.sites-runtime/`, or local credentials.
7. Create a focused commit, push the current branch to `origin`, then inspect the GitHub Actions Pages workflow.
8. Update the repository About metadata with a concise description, website URL, and relevant topics when GitHub credentials or an integration are available.
9. Report the commit SHA, remote URL, Pages URL, security-scan result, and deployment status. If GitHub-side metadata or deployment verification cannot be authenticated, state the exact remaining user action.
