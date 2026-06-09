@echo off
cd /d "c:\Users\WorkStation\Desktop\artoon\AROON_2.0\artoon-typer"
if exist "node_modules\@artoon\state" rmdir /s /q "node_modules\@artoon\state"
powershell -Command "New-Item -ItemType Junction -Path 'node_modules\@artoon\state' -Target '..\..\..\artoon-state'"
echo Done
