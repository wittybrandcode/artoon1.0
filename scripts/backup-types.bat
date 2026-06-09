@echo off
setlocal enabledelayedexpansion

:: Create timestamp for backup folder
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DIR=backups\%datetime:~0,8%_%datetime:~8,6%

mkdir "%BACKUP_DIR%" 2>nul

echo ============================================
echo   ARTOON Type Unification - Backup Script
echo ============================================
echo.
echo Creating backup at: %BACKUP_DIR%
echo.

:: Backup AST type files
echo [1/4] Backing up AST types...
copy "artoon-ast\src\types.ts" "%BACKUP_DIR%\ast-types.ts" >nul
if exist "artoon-ast\src\unified\index.ts" (
    copy "artoon-ast\src\unified\index.ts" "%BACKUP_DIR%\ast-unified.ts" >nul
)

:: Backup Parser type files
echo [2/4] Backing up Parser types...
copy "artoon-parser\src\ast\types.ts" "%BACKUP_DIR%\parser-types.ts" >nul
if exist "artoon-parser\src\inline\converter.ts" (
    copy "artoon-parser\src\inline\converter.ts" "%BACKUP_DIR%\parser-converter.ts" >nul
)

:: Backup Typer type files
echo [3/4] Backing up Typer types...
copy "artoon-typer\src\types.ts" "%BACKUP_DIR%\typer-types.ts" >nul
copy "artoon-typer\src\integration\ARTOONImporter.ts" "%BACKUP_DIR%\typer-importer.ts" >nul
copy "artoon-typer\src\integration\ARTOONExporter.ts" "%BACKUP_DIR%\typer-exporter.ts" >nul

:: Backup Consumer files
echo [4/4] Backing up Consumer files...
if exist "artoon-serializer\src\nodes\list.ts" (
    copy "artoon-serializer\src\nodes\list.ts" "%BACKUP_DIR%\serializer-list.ts" >nul
)
if exist "artoon-serializer\src\nodes\separator.ts" (
    copy "artoon-serializer\src\nodes\separator.ts" "%BACKUP_DIR%\serializer-separator.ts" >nul
)
if exist "artoon-renderer-html\src\render\list.ts" (
    copy "artoon-renderer-html\src\render\list.ts" "%BACKUP_DIR%\renderer-list.ts" >nul
)
if exist "artoon-renderer-html\src\render\separator.ts" (
    copy "artoon-renderer-html\src\render\separator.ts" "%BACKUP_DIR%\renderer-separator.ts" >nul
)

echo.
echo ============================================
echo   Backup completed successfully!
echo ============================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Files backed up:
dir /b "%BACKUP_DIR%"
echo.

endlocal
