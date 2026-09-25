---
name: course-brochure
description: Create a one-page A4 HTML brochure for a course using only data/courses.json and its matching kb/brochures/COURSE-CODE.md source.
---

# course-brochure

Use this skill when the user provides a course code and asks for a printable course brochure.

## Source and consistency rules

- Read the matching course object from `data/courses.json` and the matching Markdown brochure at `kb/brochures/<COURSE-CODE>.md`.
- Use only those two files as content sources. Do not browse, infer missing values, or use other project files to fill gaps.
- Before writing HTML, compare every overlapping value. Treat course code, title, photo, schedule, intakes, fee, what-you-learn items, allergens, and sign-up link as required brochure data. Normalize only presentation differences such as currency formatting, list punctuation, and prose around the same date or time.
- If the two sources disagree, stop without creating or overwriting the HTML file and report the exact field and both values.
- If either source is missing a required value, stop and report the missing field rather than inventing it.

## Output

- Unless the user specifies another path, write `dist/brochures/<COURSE-CODE>.html`, creating the directory if needed.
- Make the document a printable one-page A4 brochure using `@page { size: A4; }` and print-safe CSS. Keep all required content within one page and use semantic, accessible HTML.
- Use the photo URL represented by the course object's `img` value with the site's established Unsplash URL pattern. Do not select a different image.
- Include only: course title and code, photo, schedule, intakes, fee, what you learn, allergens, and the sign-up link. Escape course content before inserting it into HTML.
- After generating the brochure, report the output path and the two source files used.
