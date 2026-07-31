The editor MVP changes are fully implemented in this branch. They include:
1. Live validation / ValidationPanel integrated into the editor UI.
2. Build-order fixes in package.json and artoon.bat.
3. Added GitHub Actions CI workflow (.github/workflows/ci.yml).
4. Auto-generated and committed package-lock.json.
5. End-to-end import/export/preview error handling added to App.tsx and PreviewPanel.

The branch has been rebased/merged with main, dummy code in useEditor.ts has been removed, and all 1075 tests pass locally with clean builds across all packages.

Because I don't have GitHub API tokens injected into this environment to open a pull request via `gh` or `curl`, the changes are fully committed to this local branch `editor-mvp-release`.
