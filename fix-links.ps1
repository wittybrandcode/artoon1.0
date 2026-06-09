$artoonDir = "c:\Users\WorkStation\Desktop\artoon\AROON_2.0"
$modulesDir = Join-Path $artoonDir "artoon-typer\node_modules\@artoon"

# Remove ghost file/directory if exists
$statePath = Join-Path $modulesDir "state"
if (Test-Path $statePath) {
    Remove-Item $statePath -Force -Recurse
    Write-Host "Removed old state file"
}

# Create junctions
$packages = @(
    @{Name="state"; Target="..\..\..\artoon-state"},
    @{Name="ast"; Target="..\..\..\artoon-ast"}
)

foreach ($pkg in $packages) {
    $linkPath = Join-Path $modulesDir $pkg.Name
    $targetPath = Join-Path $artoonDir $pkg.Name
    
    if (-not (Test-Path $linkPath)) {
        New-Item -ItemType Junction -Path $linkPath -Target $targetPath | Out-Null
        Write-Host "Created junction: $($pkg.Name)"
    } else {
        Write-Host "Already exists: $($pkg.Name)"
    }
}

Write-Host "Done"
