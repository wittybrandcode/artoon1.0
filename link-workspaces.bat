@echo off
cd /d "c:\Users\WorkStation\Desktop\artoon\AROON_2.0"

if not exist "node_modules" mkdir "node_modules"

for %%P in (artoon-ast artoon-parser artoon-serializer artoon-validator artoon-renderer-html artoon-cli artoon-state artoon-typer vscode-artoon) do (
    if exist "%%P" (
        if not exist "node_modules\@artoon\%%P" (
            mklink /J "node_modules\@artoon\%%P" "%%P" 2>nul
            echo Linked %%P
        ) else (
            echo Already linked: %%P
        )
    )
)

echo Workspace links created.
pause
