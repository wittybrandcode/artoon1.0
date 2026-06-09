@echo off
chcp 65001 >nul
echo ========================================
echo   AROON 2.0 - Safe Cleanup Execution
echo ========================================
echo.

REM Create archive structure
echo [1/6] Creating archive structure...
mkdir _ARCHIVE\reports 2>nul
mkdir _ARCHIVE\plans 2>nul
mkdir _ARCHIVE\diagnostics 2>nul
mkdir _ARCHIVE\temp-files 2>nul
mkdir _ARCHIVE\prototypes 2>nul
mkdir _ARCHIVE\docs-plans 2>nul
echo    Archive structure created.
echo.

REM Move completed plan folders
echo [2/6] Moving completed plan folders...
if exist "COMPOUND-BLOCKS-FIX" (
  move "COMPOUND-BLOCKS-FIX" "_ARCHIVE\plans\" >nul 2>&1
  echo    - COMPOUND-BLOCKS-FIX moved
)
if exist "PLANS-AND-ANALYSIS" (
  move "PLANS-AND-ANALYSIS" "_ARCHIVE\plans\" >nul 2>&1
  echo    - PLANS-AND-ANALYSIS moved
)
if exist "EDITOR-UI-DEVELOPMENT-PLAN" (
  move "EDITOR-UI-DEVELOPMENT-PLAN" "_ARCHIVE\plans\" >nul 2>&1
  echo    - EDITOR-UI-DEVELOPMENT-PLAN moved
)
if exist "artoon-typer-prototype" (
  move "artoon-typer-prototype" "_ARCHIVE\prototypes\" >nul 2>&1
  echo    - artoon-typer-prototype moved
)
if exist "artoon-final-integration-plan" (
  move "artoon-final-integration-plan" "_ARCHIVE\plans\" >nul 2>&1
  echo    - artoon-final-integration-plan moved
)
echo.

REM Move diagnostic docs from docs folder
echo [3/6] Moving diagnostic documents...
if exist "docs\DIVER DOCS" (
  move "docs\DIVER DOCS" "_ARCHIVE\diagnostics\" >nul 2>&1
  echo    - docs/DIVER DOCS moved
)
if exist "docs\PROFESSIONAL-EDITOR-PLAN" (
  move "docs\PROFESSIONAL-EDITOR-PLAN" "_ARCHIVE\docs-plans\" >nul 2>&1
  echo    - docs/PROFESSIONAL-EDITOR-PLAN moved
)
if exist "docs\IMPLEMENTATION-ROADMAP" (
  move "docs\IMPLEMENTATION-ROADMAP" "_ARCHIVE\docs-plans\" >nul 2>&1
  echo    - docs/IMPLEMENTATION-ROADMAP moved
)
if exist "docs\SESSION-REPORTS" (
  move "docs\SESSION-REPORTS" "_ARCHIVE\reports\" >nul 2>&1
  echo    - docs/SESSION-REPORTS moved
)
echo.

REM Move temp markdown files from root (reports/diagnostics)
echo [4/6] Moving temp markdown files from root...
if exist "ANALYSIS-SUMMARY-AR.md" move "ANALYSIS-SUMMARY-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "CONTEXT-COMPLETE-AR.md" move "CONTEXT-COMPLETE-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "EDITOR-BLOCKS-DISPLAY-ISSUE-AR.md" move "EDITOR-BLOCKS-DISPLAY-ISSUE-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "EDITOR-IMAGE-ISSUE-SOLUTION-AR.md" move "EDITOR-IMAGE-ISSUE-SOLUTION-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "MEDIA-BLOCKS-FIX-AR.md" move "MEDIA-BLOCKS-FIX-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "IMMEDIATE-ACTION-PLAN-AR.md" move "IMMEDIATE-ACTION-PLAN-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "PUBLISHING-DECISION-AR.md" move "PUBLISHING-DECISION-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "SCRIPTS-MIGRATION-SUMMARY-AR.md" move "SCRIPTS-MIGRATION-SUMMARY-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "STATUS-NOW-AR.md" move "STATUS-NOW-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "STRATEGIC-VISION-SUMMARY-AR.md" move "STRATEGIC-VISION-SUMMARY-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "SYSTEMS-ANALYSIS-REPORT-AR.md" move "SYSTEMS-ANALYSIS-REPORT-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "URGENT-NOW-AR.md" move "URGENT-NOW-AR.md" "_ARCHIVE\reports\" >nul 2>&1
echo    Root temp reports moved.
echo.

REM Move duplicate/superceded start files
echo [5/6] Moving duplicate start files...
if exist "START-HERE-NOW-AR.md" move "START-HERE-NOW-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "START-HERE-WYSIWYG-AR.md" move "START-HERE-WYSIWYG-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "START-NEXT-SESSION-AR.md" move "START-NEXT-SESSION-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "NEXT-ACTION-AR.md" move "NEXT-ACTION-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "NEXT-ACTION-NOW-AR.md" move "NEXT-ACTION-NOW-AR.md" "_ARCHIVE\reports\" >nul 2>&1
if exist "NEXT-STEP-AR.md" move "NEXT-STEP-AR.md" "_ARCHIVE\reports\" >nul 2>&1
echo    Duplicate start/action files moved.
echo.

REM Delete temp test files in root (not in packages)
echo [6/6] Deleting temp test files in root...
if exist "test-blocks-showcase-parse.mjs" del "test-blocks-showcase-parse.mjs" >nul 2>&1
if exist "test-compound-blocks.artoon" del "test-compound-blocks.artoon" >nul 2>&1
if exist "test-editor-import.mjs" del "test-editor-import.mjs" >nul 2>&1
if exist "test-image-parsing.mjs" del "test-image-parsing.mjs" >nul 2>&1
if exist "test-meta-preview.html" del "test-meta-preview.html" >nul 2>&1
if exist "test-parse-direct.mjs" del "test-parse-direct.mjs" >nul 2>&1
if exist "test-parse-output.json" del "test-parse-output.json" >nul 2>&1
if exist "test-v1-ast.json" del "test-v1-ast.json" >nul 2>&1
if exist "package-lock.json.bak" del "package-lock.json.bak" >nul 2>&1
if exist "artoon-typer-prototype.zip" del "artoon-typer-prototype.zip" >nul 2>&1
echo    Temp test files deleted.
echo.

echo ========================================
echo   Cleanup completed successfully!
echo ========================================
echo.
echo Kept in root:
echo   - README.md, CHANGELOG.md, MIGRATION-GUIDE.md
echo   - Core Invariants/, docs/ (clean), artoon-*/ (all packages)
echo   - artoon-examples/, samples/, tests/, scripts/
echo.
echo Archived to _ARCHIVE/:
echo   - Completed plan folders
echo   - Diagnostic reports
echo   - Session reports
echo   - Duplicate start files
echo.
pause
