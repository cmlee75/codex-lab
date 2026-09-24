# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free static website for Cook & Bake Academy. Keep the page shell and semantic content in `index.html`, presentation and responsive rules in `styles.css`, and browser behavior in `app.js`. Course catalogue data is loaded from `data/courses.json`; preserve its object shape when adding or editing courses. The `lab1/` directory contains earlier research and prototype material, not the live site. Brand and image-direction references live in `brand.md` and `hero-images.md`.

## Build, Test, and Development Commands

There is no build step, package manager, or automated test suite. Serve the repository over HTTP so `fetch("data/courses.json")` works:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. Check the browser console for data-loading errors and test the category chips, search field, empty state, and responsive layouts at desktop and mobile widths.

No framework. Never put an API key in code.

## Coding Style & Naming Conventions

Use two-space indentation in HTML, CSS, and JavaScript. Prefer semantic HTML, accessible labels, and native elements before adding ARIA. JavaScript uses `const` by default, double-quoted strings, camelCase functions and variables, and small functions that construct DOM nodes safely with `textContent`. CSS class names use kebab-case (for example, `.course-card-body`); state classes use the `is-` prefix (for example, `.is-active`). Keep CSS custom properties in `:root` and retain the existing mobile-first responsive breakpoints.

Follow `brand.md`: warm, direct copy; Georgia headings; system sans-serif body text; and the documented colour tokens. Use appropriate image `alt` text, or empty `alt` for decorative images.

## Testing Guidelines

Manually test each change in a local server session. For data changes, confirm every course renders with its image, fee, schedule, category, and campus; verify filtering and search return expected results. Test keyboard navigation, visible focus states, and the reduced-motion preference. Add a regression test setup only when introducing tooling that makes it practical.

## Commit & Pull Request Guidelines

The repository has no commit history yet, so use concise imperative commit subjects such as `Add campus empty state` or `Update sourdough course details`. Keep commits focused. Pull requests should summarize the user-facing change, note data/content updates, link relevant issues when available, and include screenshots for visual or responsive changes. State the manual checks performed.
