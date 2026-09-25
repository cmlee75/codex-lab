---
name: kb-update
description: Keep course catalogue data and knowledge-base brochures aligned when a course or its fee, date, allergen, or policy details change.
---

# kb-update

Use this skill when a course is added, changed, or withdrawn, or when a fee, date, allergen, or policy changes.

## Workflow

1. Update `data/courses.json` first.
2. Update the matching brochure in `kb/brochures/` so it reflects the catalogue data and current policy details.
3. Run `npm run check`.
4. Report the files changed and the evaluation score from the check output.

Never edit the golden questions to make the evaluation pass. If the check fails, report the failure and its score rather than changing `eval/golden-questions.csv`.
