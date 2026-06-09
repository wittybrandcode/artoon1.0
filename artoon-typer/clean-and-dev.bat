@echo off
echo ========================================
echo ARTOON Typer - Clean Cache and Dev
echo ========================================
echo.

echo Stopping any running dev server...
echo (Press Ctrl+C if server is running)
echo.

echo Cleaning Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache cleared!
) else (
    echo No cache found.
)
echo.

echo Starting dev server...
npm run dev
