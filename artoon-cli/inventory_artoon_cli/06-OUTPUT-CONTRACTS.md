# 06 — OUTPUT CONTRACTS

```yaml
FILE: 06-OUTPUT-CONTRACTS.md
SYSTEM: @artoon/cli
AI_PRIORITY: HIGH
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: stdout/stderr contracts. Use for scripting and piping. -->

---

## 📋 OUTPUT CHANNEL CONTRACTS

| Channel | Purpose | Content |
|---------|---------|---------|
| `stdout` | Data output | JSON, HTML, validation results |
| `stderr` | Error messages | Errors, warnings, status messages |

---

## 🔧 STDOUT CONTRACT

### Rule: Data Only

```bash
# stdout contains ONLY the requested data
artoon parse doc.artoon
# stdout: JSON AST

artoon render doc.artoon
# stdout: HTML

artoon validate doc.artoon --json
# stdout: JSON validation result
```

### Why?

```
stdout is for piping and redirection.
Data must be clean and parseable.
No status messages, no decorations.
```

### Examples

```bash
# Pipe JSON to jq
artoon parse doc.artoon | jq '.content[0]'

# Redirect HTML to file
artoon render doc.artoon > output.html

# Pipe to clipboard
artoon render doc.artoon | pbcopy

# Chain with other tools
artoon parse doc.artoon | python process.py
```

---

## 🔧 STDERR CONTRACT

### Rule: Messages Only

```bash
# stderr contains status messages and errors
artoon parse doc.artoon -o out.json
# stderr: ✓ AST written to out.json

artoon validate doc.artoon
# stderr: error line 5: Invalid direction marker
# stderr: ─────────────────────────────────────────────────
# stderr: 1 error, 0 warnings
```

### Why?

```
stderr is for human feedback.
Errors and status don't pollute data stream.
Can be suppressed with 2>/dev/null.
```

### Message Types

| Type | Symbol | Color | Example |
|------|--------|-------|---------|
| Success | ✓ | Green | `✓ AST written to out.json` |
| Error | ✗ | Red | `✗ File not found: doc.artoon` |
| Warning | ⚠ | Yellow | `⚠ line 10: Empty paragraph` |
| Info | ℹ | Blue | `ℹ Processing...` |

---

## 📊 OUTPUT BY COMMAND

### parse

```bash
# To stdout (default)
artoon parse doc.artoon
# stdout: {"ast": {...}, "errors": []}

# To file
artoon parse doc.artoon -o out.json
# stdout: (empty)
# stderr: ✓ AST written to out.json

# Error case
artoon parse missing.artoon
# stdout: (empty)
# stderr: ✗ File not found: missing.artoon
```

### render

```bash
# To stdout (default)
artoon render doc.artoon
# stdout: <p dir="rtl">مرحباً</p>

# To file
artoon render doc.artoon -o out.html
# stdout: (empty)
# stderr: ✓ HTML written to out.html

# Error case
artoon render invalid.artoon
# stdout: (empty)
# stderr: ✗ line 5: Invalid direction marker
```

### validate

```bash
# Human-readable (default)
artoon validate doc.artoon
# stdout: (empty)
# stderr: error line 5: [PARSE] Invalid direction marker
# stderr: ─────────────────────────────────────────────────
# stderr: 1 error, 0 warnings

# JSON output
artoon validate doc.artoon --json
# stdout: {"valid": false, "errors": 1, ...}
# stderr: (empty)

# Valid file
artoon validate valid.artoon
# stdout: (empty)
# stderr: ✓ valid.artoon is valid

# Quiet mode
artoon validate doc.artoon -q
# stdout: (empty)
# stderr: error line 5: [PARSE] Invalid direction marker
# (no summary)
```

---

## 🔧 OUTPUT FORMAT DETAILS

### JSON Output (parse)

```json
// Parser AST (default)
{
  "ast": {
    "type": "document",
    "children": [
      {
        "type": "text",
        "textType": "p",
        "direction": "rtl",
        "line": 1,
        "content": [...]
      }
    ]
  },
  "errors": []
}

// Canonical AST (--transformed)
{
  "version": "1.0",
  "meta": {
    "title": "Document Title"
  },
  "content": [
    {
      "nodeType": "text",
      "textType": "p",
      "direction": "rtl",
      "line": 1,
      "content": [...]
    }
  ]
}
```

### HTML Output (render)

```html
<!-- Fragment (default) -->
<p dir="rtl">مرحباً بالعالم</p>
<h1 dir="rtl">عنوان</h1>

<!-- Full document (--full) -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARTOON Document</title>
  <style>...</style>
</head>
<body dir="rtl">
  <p dir="rtl">مرحباً بالعالم</p>
  <h1 dir="rtl">عنوان</h1>
</body>
</html>
```

### Validation Output (validate)

```
# Human-readable
error line 5: [PARSE] Invalid direction marker
warn  line 10: [WARN] Empty paragraph
─────────────────────────────────────────────────
1 error, 1 warning

# JSON (--json)
{
  "valid": false,
  "file": "document.artoon",
  "errors": 1,
  "warnings": 1,
  "issues": [
    {
      "severity": "error",
      "code": "PARSE",
      "message": "Invalid direction marker",
      "line": 5
    },
    {
      "severity": "warning",
      "code": "WARN",
      "message": "Empty paragraph",
      "line": 10
    }
  ]
}
```

---

## 💡 SCRIPTING PATTERNS

```bash
# Capture stdout only
output=$(artoon parse doc.artoon)

# Capture stderr only
errors=$(artoon validate doc.artoon 2>&1 >/dev/null)

# Suppress stderr
artoon render doc.artoon 2>/dev/null > out.html

# Separate stdout and stderr
artoon validate doc.artoon > result.json 2> errors.log

# Check if output is empty
if [ -z "$(artoon parse doc.artoon)" ]; then
  echo "No output"
fi
```

---

## 📊 OUTPUT CONTRACT SUMMARY

```yaml
STDOUT:
  - Contains ONLY data (JSON, HTML)
  - No status messages
  - No decorations
  - Parseable by other tools
  - Empty when writing to file

STDERR:
  - Contains status messages
  - Contains error messages
  - Contains warnings
  - Human-readable format
  - Can be suppressed

GUARANTEES:
  - stdout is always valid JSON/HTML (when successful)
  - stderr never contains data
  - Channels are consistent across commands
  - Format is stable across versions
```
