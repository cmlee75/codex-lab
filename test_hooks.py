#!/usr/bin/env python3
"""Offline tests for the Lab 10 hooks. Run from the project root:
    python3 test_hooks.py
"""
import json
import subprocess

GUARD = ".codex/hooks/guard_secrets.py"
CASES = [
    ("key in a patch", {"tool_name": "apply_patch", "tool_input": {"input":
      "*** Update File: js/chat.js\n+const KEY = 'sk-proj-abcdefghijklmnopqrstuvwx1234';"}}, True),
    ("force push", {"tool_name": "Bash", "tool_input": {"command": "git push --force origin main"}}, True),
    ("rm -rf", {"tool_name": "Bash", "tool_input": {"command": "rm -rf data"}}, True),
    (".env write", {"tool_name": "Write", "tool_input": {"file_path": ".env", "content": "X=1"}}, True),
    (".env.local write", {"tool_name": "Write", "tool_input": {"file_path": "config/.env.local"}}, True),
    (".env.example allowed", {"tool_name": "Write", "tool_input": {"file_path": ".env.example"}}, False),
    ("normal CSS edit", {"tool_name": "apply_patch", "tool_input": {"input": "*** Update File: css/styles.css"}}, False),
    ("normal git push", {"tool_name": "Bash", "tool_input": {"command": "git push origin feature/signup"}}, False),
    ("the word environment", {"tool_name": "Write", "tool_input": {"file_path": "README.md",
      "content": "Set up your environment first."}}, False),
]
bad = 0
for name, event, expect_deny in CASES:
    out = subprocess.run(["python3", GUARD], input=json.dumps(event),
                         capture_output=True, text=True).stdout
    denied = '"deny"' in out
    ok = denied == expect_deny
    bad += not ok
    print("PASS" if ok else "FAIL", name, "-> denied" if denied else "-> allowed")
print("ALL 9 PASS" if not bad else f"{bad} FAILED")
raise SystemExit(bad)
