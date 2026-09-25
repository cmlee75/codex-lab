# Security review scope (Lab 8)

Review the static Cook & Bake site as it stands after Lab 7.

In scope
- The sign-up form and what it stores in localStorage.
- admin.html — who can open it, what it exposes.
- ChatGPT mode: where the key lives, where it is sent.
- Prompt injection against the assistant (see Lab 6 red-team.csv).
- Third-party content: Unsplash images, the SQLite WASM files.
- Missing browser protections (Content-Security-Policy, referrer).

Out of scope
- Real learner data (there is none), hosting providers, social accounts.

Report
Findings ranked Critical/High/Medium/Low, each with evidence (file and
line), impact in plain words, and a proposed fix. Do not apply fixes.
