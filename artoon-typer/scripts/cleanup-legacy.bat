@echo off
REM Cleanup Legacy Files Script
REM Moves old/unused files to backups folder

echo ========================================
echo ARTOON-TYPER: Cleanup Legacy Files
echo ========================================
echo.

echo This script will move the following to backups:
echo   - vanilla/ folder (Vanilla JS prototype)
echo   - mockup/ folder (Old HTML mockup)
echo   - test-nested.js (Old test file)
echo   - test-component-flow.ts (Debug script)
echo.

set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    exit /b 0
)

echo.
echo [1/5] Creating backup folder...
if not exist ..\backups\legacy-code (
    mkdir ..\backups\legacy-code
    echo     ✓ Created backups\legacy-code
) else (
    echo     ℹ Folder already exists
)

echo.
echo [2/5] Moving vanilla/ folder...
if exist vanilla (
    move vanilla ..\backups\legacy-code\vanilla
    echo     ✓ Moved vanilla/
) else (
    echo     ℹ vanilla/ not found
)

echo.
echo [3/5] Moving mockup/ folder...
if exist mockup (
    move mockup ..\backups\legacy-code\mockup
    echo     ✓ Moved mockup/
) else (
    echo     ℹ mockup/ not found
)

echo.
echo [4/5] Moving test-nested.js...
if exist test-nested.js (
    move test-nested.js ..\backups\legacy-code\test-nested.js
    echo     ✓ Moved test-nested.js
) else (
    echo     ℹ test-nested.js not found
)

echo.
echo [5/5] Moving test-component-flow.ts to scripts/...
if exist test-component-flow.ts (
    move test-component-flow.ts scripts\diagnose-component-flow.ts
    echo     ✓ Moved to scripts\diagnose-component-flow.ts
) else (
    echo     ℹ test-component-flow.ts not found
)

echo.
echo ========================================
echo Cleanup completed!
echo Legacy files moved to: ..\backups\legacy-code\
echo ========================================
echo.

pause
