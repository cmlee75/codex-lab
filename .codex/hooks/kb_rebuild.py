#!/usr/bin/env python3
"""PostToolUse hook — rebuild and re-test the knowledge base after edits.

Whenever Codex edits a brochure, the FAQ, the policies or courses.json,
the chatbot's academy.db is stale. This hook notices, rebuilds it, runs
the 30-question golden set, and hands the score back to Codex as extra
context — so a brochure edit that breaks an answer is caught in the same
turn, not by a customer.
"""
import json
import subprocess
import sys

WATCHED = ("kb/", "courses.json")


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def main():
    try:
        event = json.load(sys.stdin)
    except json.JSONDecodeError:
        return
    touched = json.dumps(event.get("tool_input", ""))
    if not any(w in touched for w in WATCHED):
        return

    code, out = run("npm run --silent build:kb")
    if code:
        context = f"Knowledge base rebuild FAILED after your edit:\n{out[-1500:]}"
    else:
        code, out = run("npm run --silent eval")
        lines = out.splitlines()
        summary = lines[-1] if lines else "no output"
        fails = "\n".join(l for l in lines if l.startswith("FAIL"))[:1500]
        context = (f"Knowledge base rebuilt and re-tested: {summary}"
                   + (f"\nThese golden questions now fail — fix them before "
                      f"you finish:\n{fails}" if code else ""))

    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": context}}))


if __name__ == "__main__":
    main()
