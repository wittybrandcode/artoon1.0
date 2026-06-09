@echo off
REM Clean and Rebuild Script for ARTOON-TYPER
REM This script cleans build artifacts and rebuilds the editor

echo ========================================
echo ARTOON-TYPER: Clean and Rebuild
echo ========================================
echo.

echo [1/4] Cleaning dist-app folder...
if exist dist-app (
    rmdir /s /q dist-app
    echo     ✓ dist-app removed
) else (
    echo     ℹ dist-app not found
)

echo.
echo [2/4] Cleaning node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo     ✓ node_modules\.cache removed
) else (
    echo     ℹ node_modules\.cache not found
)

echo.
echo [3/4] Running build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo     ✗ Build failed!
    exit /b 1
)
echo     ✓ Build completed

echo.
echo [4/4] Done!
echo.
echo ========================================
echo Next steps:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Run: npm run dev
echo ========================================
echo.

pause
