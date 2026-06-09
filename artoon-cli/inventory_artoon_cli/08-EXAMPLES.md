# 08 — EXAMPLES

```yaml
FILE: 08-EXAMPLES.md
SYSTEM: @artoon/cli
AI_PRIORITY: HIGH
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: Practical usage examples. Use for learning CLI patterns. -->

---

## 📋 BASIC EXAMPLES

### Parse Command

```bash
# Parse to stdout
artoon parse document.artoon

# Parse to file
artoon parse document.artoon -o ast.json

# Compact JSON
artoon parse document.artoon -c

# Canonical AST
artoon parse document.artoon -t

# Compact canonical AST to file
artoon parse document.artoon -t -c -o ast.json
```

### Render Command

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

### Validate Command

```bash
# Validate file
artoon validate document.artoon

# Strict mode
artoon validate document.artoon --strict

# Quiet mode
artoon validate document.artoon -q

# JSON output
artoon validate document.artoon --json

# Strict + JSON
artoon validate document.artoon -s --json
```

---

## 📋 PIPING EXAMPLES

### With jq (JSON processing)

```bash
# Get first content node
artoon parse doc.artoon | jq '.content[0]'

# Count nodes
artoon parse doc.artoon -t | jq '.content | length'

# Filter text nodes
artoon parse doc.artoon -t | jq '.content[] | select(.nodeType == "text")'

# Get all headings
artoon parse doc.artoon -t | jq '.content[] | select(.textType | startswith("t"))'
```

### With grep

```bash
# Find lines with errors
artoon validate doc.artoon 2>&1 | grep "error"

# Count errors
artoon validate doc.artoon 2>&1 | grep -c "error"
```

### With other tools

```bash
# Copy HTML to clipboard (macOS)
artoon render doc.artoon | pbcopy

# Copy HTML to clipboard (Linux)
artoon render doc.artoon | xclip -selection clipboard

# Pretty print HTML
artoon render doc.artoon | prettier --parser html

# Minify HTML
artoon render doc.artoon | html-minifier
```

---

## 📋 SCRIPTING EXAMPLES

### Bash Script

```bash
#!/bin/bash

# Validate all ARTOON files in directory
validate_all() {
  local dir="${1:-.}"
  local errors=0
  
  for file in "$dir"/*.artoon; do
    if [ -f "$file" ]; then
      echo "Validating: $file"
      if ! artoon validate "$file" -q; then
        ((errors++))
      fi
    fi
  done
  
  echo "─────────────────────────────────────────────────"
  if [ $errors -eq 0 ]; then
    echo "✓ All files valid"
    return 0
  else
    echo "✗ $errors file(s) with errors"
    return 1
  fi
}

validate_all "$1"
```

### Build Script

```bash
#!/bin/bash

# Build ARTOON docs to HTML
build_docs() {
  local src="${1:-docs}"
  local out="${2:-dist}"
  
  mkdir -p "$out"
  
  for file in "$src"/*.artoon; do
    if [ -f "$file" ]; then
      name=$(basename "$file" .artoon)
      echo "Building: $name"
      
      # Validate first
      if ! artoon validate "$file" -q; then
        echo "✗ Validation failed: $file"
        continue
      fi
      
      # Render to HTML
      artoon render "$file" -f -o "$out/$name.html"
    fi
  done
  
  echo "✓ Build complete"
}

build_docs "$1" "$2"
```

### PowerShell Script

```powershell
# Validate all ARTOON files
function Validate-ArtoonFiles {
    param(
        [string]$Path = "."
    )
    
    $files = Get-ChildItem -Path $Path -Filter "*.artoon"
    $errors = 0
    
    foreach ($file in $files) {
        Write-Host "Validating: $($file.Name)"
        artoon validate $file.FullName -q
        if ($LASTEXITCODE -ne 0) {
            $errors++
        }
    }
    
    Write-Host "─────────────────────────────────────────────────"
    if ($errors -eq 0) {
        Write-Host "✓ All files valid" -ForegroundColor Green
    } else {
        Write-Host "✗ $errors file(s) with errors" -ForegroundColor Red
    }
}
```

---

## 📋 CI/CD EXAMPLES

### GitHub Actions

```yaml
name: Validate ARTOON

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install ARTOON CLI
        run: npm install -g @artoon/cli
      
      - name: Validate files
        run: |
          for file in docs/*.artoon; do
            echo "Validating: $file"
            artoon validate "$file" --strict
          done
      
      - name: Build HTML
        run: |
          mkdir -p dist
          for file in docs/*.artoon; do
            name=$(basename "$file" .artoon)
            artoon render "$file" -f -o "dist/$name.html"
          done
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: html-docs
          path: dist/
```

### GitLab CI

```yaml
validate:
  stage: test
  script:
    - npm install -g @artoon/cli
    - |
      for file in docs/*.artoon; do
        artoon validate "$file" --strict
      done

build:
  stage: build
  script:
    - npm install -g @artoon/cli
    - mkdir -p dist
    - |
      for file in docs/*.artoon; do
        name=$(basename "$file" .artoon)
        artoon render "$file" -f -o "dist/$name.html"
      done
  artifacts:
    paths:
      - dist/
```

---

## 📋 INTEGRATION EXAMPLES

### Node.js

```javascript
const { execSync } = require('child_process');

// Parse file
function parseArtoon(file) {
  const output = execSync(`artoon parse "${file}" -t`, { encoding: 'utf-8' });
  return JSON.parse(output);
}

// Validate file
function validateArtoon(file) {
  try {
    execSync(`artoon validate "${file}" --strict`, { stdio: 'pipe' });
    return { valid: true };
  } catch (error) {
    return { valid: false, exitCode: error.status };
  }
}

// Render file
function renderArtoon(file, full = false) {
  const cmd = full 
    ? `artoon render "${file}" -f`
    : `artoon render "${file}"`;
  return execSync(cmd, { encoding: 'utf-8' });
}
```

### Python

```python
import subprocess
import json

def parse_artoon(file):
    result = subprocess.run(
        ['artoon', 'parse', file, '-t'],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise Exception(result.stderr)
    return json.loads(result.stdout)

def validate_artoon(file):
    result = subprocess.run(
        ['artoon', 'validate', file, '--json'],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

def render_artoon(file, full=False):
    cmd = ['artoon', 'render', file]
    if full:
        cmd.append('-f')
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(result.stderr)
    return result.stdout
```

---

## 📋 WATCH MODE (External)

```bash
# Using nodemon
nodemon --ext artoon --exec "artoon validate" docs/

# Using chokidar-cli
chokidar "docs/*.artoon" -c "artoon validate {path}"

# Using entr (Linux/macOS)
ls docs/*.artoon | entr -c artoon validate /_
```
