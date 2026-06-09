# 04 — COMMANDS

```yaml
FILE: 04-COMMANDS.md
SYSTEM: @artoon/cli
AI_PRIORITY: CRITICAL
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: Complete command reference. Use for CLI usage. -->

---

## 📋 COMMAND OVERVIEW

| Command | Description | Exit Codes |
|---------|-------------|------------|
| `parse` | Parse ARTOON file to JSON AST | 0, 1, 4, 5 |
| `render` | Render ARTOON file to HTML | 0, 1, 4, 5 |
| `validate` | Validate ARTOON file | 0, 1, 2, 3, 4 |
| `lint` | Alias for validate | 0, 1, 2, 3, 4 |

---

## 🔧 PARSE COMMAND

```bash
artoon parse <file> [options]
```

### Description

Parse ARTOON file and output AST as JSON.

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--output <file>` | `-o` | Write to file instead of stdout | stdout |
| `--compact` | `-c` | Compact JSON (no formatting) | false |
| `--transformed` | `-t` | Output canonical AST | false |

### Examples

```bash
# Parse to stdout
artoon parse document.artoon

# Parse to file
artoon parse document.artoon -o ast.json

# Compact JSON
artoon parse document.artoon -c

# Canonical AST (transformed)
artoon parse document.artoon -t

# Compact canonical AST to file
artoon parse document.artoon -t -c -o ast.json
```

### Output

```json
// Without --transformed (Parser AST)
{
  "ast": {
    "type": "document",
    "children": [...]
  },
  "errors": []
}

// With --transformed (Canonical AST)
{
  "version": "1.0",
  "content": [...],
  "meta": {...}
}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Syntax error (parse failed) |
| 4 | File not found |
| 5 | I/O error (write failed) |

---

## 🔧 RENDER COMMAND

```bash
artoon render <file> [options]
```

### Description

Render ARTOON file to HTML.

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--output <file>` | `-o` | Write to file instead of stdout | stdout |
| `--full` | `-f` | Generate full HTML document | false |
| `--no-direction` | | Disable direction attributes | false |

### Examples

```bash
# Render to stdout
artoon render document.artoon

# Render to file
artoon render document.artoon -o output.html

# Full HTML document
artoon render document.artoon -f

# Full document to file
artoon render document.artoon -f -o output.html

# Without direction attributes
artoon render document.artoon --no-direction
```

### Output

```html
<!-- Without --full -->
<p dir="rtl">مرحباً بالعالم</p>

<!-- With --full -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>ARTOON Document</title>
  ...
</head>
<body dir="rtl">
  <p dir="rtl">مرحباً بالعالم</p>
</body>
</html>
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Syntax error (parse failed) |
| 4 | File not found |
| 5 | I/O error (write failed) |

---

## 🔧 VALIDATE COMMAND

```bash
artoon validate <file> [options]
```

### Description

Validate ARTOON file and report issues.

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--strict` | `-s` | Treat warnings as errors | false |
| `--quiet` | `-q` | Only show errors, no summary | false |
| `--json` | | Output as JSON | false |

### Examples

```bash
# Validate file
artoon validate document.artoon

# Strict mode (warnings = errors)
artoon validate document.artoon --strict

# Quiet mode (errors only)
artoon validate document.artoon -q

# JSON output
artoon validate document.artoon --json

# Strict + JSON
artoon validate document.artoon -s --json
```

### Output

```
# Human-readable (default)
error line 5: [PARSE] Invalid direction marker
warn  line 10: [WARN] Empty paragraph
─────────────────────────────────────────────────
1 error, 1 warning

# JSON output
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

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Valid (no errors) |
| 1 | Syntax error (parse failed) |
| 2 | Validation error |
| 3 | Philosophy breach (strict mode) |
| 4 | File not found |

---

## 🔧 LINT COMMAND

```bash
artoon lint <file> [options]
```

### Description

Alias for `validate` command. Same options and behavior.

```bash
# These are equivalent
artoon lint document.artoon
artoon validate document.artoon
```

---

## 📊 COMMAND COMPARISON

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMAND PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   parse:    File → parse() → [transform()] → JSON                      │
│                                                                         │
│   render:   File → parse() → transform() → render() → HTML             │
│                                                                         │
│   validate: File → parse() → transform() → validate() → Report         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 USAGE TIPS

```bash
# Pipe to other tools
artoon parse doc.artoon | jq '.content[0]'
artoon render doc.artoon | pbcopy

# Check exit code in scripts
artoon validate doc.artoon && echo "Valid!" || echo "Invalid!"

# Batch processing
for f in *.artoon; do artoon validate "$f"; done

# CI/CD integration
artoon validate doc.artoon --json > report.json
```
