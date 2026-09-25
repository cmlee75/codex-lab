#!/usr/bin/env python3
"""PreToolUse hook — stop secrets and destructive commands before they run.

A static site ships every file to every visitor, so an API key written
into js/ or committed to the repo is public the moment it deploys. This
hook inspects what Codex is about to run or write and denies it when it
finds:
  * an OpenAI-style API key (sk-...) or a .env file being written
  * a force push, rm -rf, or git clean
Everything else passes through untouched.
"""
import json
import re
import sys

KEY = re.compile(r"sk-(proj-)?[A-Za-z0-9_\-]{20,}")
DESTRUCTIVE = re.compile(
    r"\bgit\s+push\b[^\n]*(--force|-f\b)|\brm\s+-[a-z]*r[a-z]*f|\bgit\s+clean\b")
ENV_WRITE = re.compile(r"(^|[\s/\"'])\.env(?!\.example)(\.[A-Za-z0-9]+)?(?=[\"'\s]|$)")


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason}}))
    sys.exit(0)


def main():
    try:
        event = json.load(sys.stdin)
    except json.JSONDecodeError:
        return          # not a payload we understand — let Codex decide
    tool = event.get("tool_name", "")
    payload = json.dumps(event.get("tool_input", ""))

    if KEY.search(payload):
        deny("Blocked: this would write or run an API key. Keys must never be "
             "in a static site or the repo — ChatGPT mode takes the key from "
             "the visitor's browser session instead.")
    if tool == "Bash" and DESTRUCTIVE.search(payload):
        deny("Blocked: destructive command (force push, rm -rf or git clean). "
             "Ask the user to run it themselves if it is really intended.")
    if tool != "Bash" and ENV_WRITE.search(payload):
        deny("Blocked: writing a .env file. Secrets stay out of this project.")


if __name__ == "__main__":
    main()
