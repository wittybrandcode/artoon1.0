@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════
:: ARTOON 2.0 - Unified Management Tool
:: ═══════════════════════════════════════════════════════════════════════════
:: Unified script for all ARTOON 2.0 operations
:: ═══════════════════════════════════════════════════════════════════════════

set "ROOT=%~dp0"
set "VERSION=2.0.0"

:MENU
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    ARTOON %VERSION% - Management Tool                 ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo   [1] Start Editor
echo   [2] Quick Build
echo   [3] Full Build
echo   [4] Run Tests
echo   [5] Clean
echo   [6] Install Dependencies
echo   [7] Exit
echo.
set /p choice="Choose a number (1-7): "

if "%choice%"=="1" goto START_EDITOR
if "%choice%"=="2" goto QUICK_BUILD
if "%choice%"=="3" goto FULL_BUILD
if "%choice%"=="4" goto RUN_TESTS
if "%choice%"=="5" goto CLEANUP
if "%choice%"=="6" goto INSTALL_DEPS
if "%choice%"=="7" goto END

echo.
echo ❌ Invalid choice!
timeout /t 2 >nul
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [1] Start Editor
:: ═══════════════════════════════════════════════════════════════════════════
:START_EDITOR
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Start ARTOON Editor                                ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

cd /d "%ROOT%artoon-typer"

:: Check node_modules
if not exist "node_modules" (
    echo [1/2] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies!
        pause
        goto MENU
    )
    echo ✅ Installation successful
    echo.
)

echo [2/2] Starting editor...
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo   📍 Address: http://localhost:3000
echo   💡 To stop the editor: Press Ctrl+C
echo ═══════════════════════════════════════════════════════════════════════════
echo.

call npm run dev

cd /d "%ROOT%"
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [2] Quick Build (core packages only)
:: ═══════════════════════════════════════════════════════════════════════════
:QUICK_BUILD
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Quick Build                                        ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo Building core packages: Parser, Renderer, Serializer
echo.

set "FAILED=0"

:: Parser
echo [1/3] @artoon/parser...
cd /d "%ROOT%artoon-parser"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Renderer
echo [2/3] @artoon/renderer-html...
cd /d "%ROOT%artoon-renderer-html"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Serializer
echo [3/3] @artoon/serializer...
cd /d "%ROOT%artoon-serializer"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

echo.
if "%FAILED%"=="1" (
    echo ❌ Some packages failed to build!
) else (
    echo ✅ Quick build completed successfully!
)

cd /d "%ROOT%"
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [3] Full Build (all packages)
:: ═══════════════════════════════════════════════════════════════════════════
:FULL_BUILD
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Full Build                                         ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo Building all packages in correct order...
echo.

set "FAILED=0"

:: Core
echo [1/9] @artoon/core...
cd /d "%ROOT%artoon-core"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: AST
echo [2/9] @artoon/ast...
cd /d "%ROOT%artoon-ast"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Parser
echo [3/9] @artoon/parser...
cd /d "%ROOT%artoon-parser"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Editor State
echo [4/9] @artoon/state...
cd /d "%ROOT%artoon-state"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Validator
echo [5/9] @artoon/validator...
cd /d "%ROOT%artoon-validator"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Serializer
echo [6/9] @artoon/serializer...
cd /d "%ROOT%artoon-serializer"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Renderer
echo [7/9] @artoon/renderer-html...
cd /d "%ROOT%artoon-renderer-html"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: CLI
echo [8/9] @artoon/cli...
cd /d "%ROOT%artoon-cli"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

:: Typer
echo [9/9] @artoon/typer...
cd /d "%ROOT%artoon-typer"
call npm run build >nul 2>&1
if errorlevel 1 (
    echo       ❌ Failed
    set "FAILED=1"
) else (
    echo       ✅ OK
)

echo.
if "%FAILED%"=="1" (
    echo ❌ Some packages failed to build!
) else (
    echo ✅ Full build completed successfully!
)

cd /d "%ROOT%"
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [4] Run Tests
:: ═══════════════════════════════════════════════════════════════════════════
:RUN_TESTS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Run Tests                                          ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

cd /d "%ROOT%"
call npm test

echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [5] Clean
:: ═══════════════════════════════════════════════════════════════════════════
:CLEANUP
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Project Cleanup                                    ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo Will delete:
echo   • dist folders in all packages
echo   • Temporary build files
echo.
set /p confirm="Do you want to continue? (Y/N): "
if /i not "%confirm%"=="Y" goto MENU

echo.
echo Cleaning up...

:: Delete dist folders
for %%d in (artoon-ast artoon-parser artoon-validator artoon-serializer artoon-renderer-html artoon-state artoon-cli) do (
    if exist "%ROOT%%%d\dist" (
        echo   Deleting %%d\dist...
        rd /s /q "%ROOT%%%d\dist" 2>nul
    )
)

echo.
echo ✅ Cleanup completed!
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: [6] Install Dependencies
:: ═══════════════════════════════════════════════════════════════════════════
:INSTALL_DEPS
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Install Dependencies                               ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

cd /d "%ROOT%"
echo Installing root dependencies...
call npm install

echo.
echo ✅ Installation completed!
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════
:: Exit
:: ═══════════════════════════════════════════════════════════════════════════
:END
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                    Thank you for using ARTOON 2.0                     ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
timeout /t 2 >nul
exit /b 0
