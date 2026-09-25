# Course assistant — specification

## Where it lives
A floating panel opened by "Ask a question" and "Ask our course
assistant". Plain HTML, CSS and JavaScript — no backend.

## How it answers (search mode)
1. Load `data/academy.db` once into SQLite WASM (in memory).
2. Turn the question into a safe FTS5 query: lowercase, drop stopwords,
   quote every term, join with OR. Never pass raw text to MATCH.
3. Rank with `bm25(chunks, 0, 6, 3, 1, 0)` — title matters most.
4. Answer with the best section's text, then list the top 3 sources as
   links to the course card or FAQ.
5. No results → the refusal: "I can only answer questions about
   Cook & Bake's courses, schedules, fees, campuses and policies…"

## Questions search cannot answer
"Cheapest", "most expensive", "under S$500": query the `courses` table.

## Words the documents never use
Map "how long" → duration, "when/start" → intakes, "how much" → fee,
"where" → address, allergy words → allergens. That is query expansion.

## Rules
- Render all text with `textContent`.
- `js/rag.js` is shared with `scripts/eval.mjs` — test what you ship.
