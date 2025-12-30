# Release Build Output

This directory contains the production-ready installers for Handsome Terminal v1.0.0.

## Files
- `Handsome Terminal-1.0.0-arm64.dmg`: MacOS Installer (Apple Silicon)
- `Handsome Terminal-1.0.0-arm64-mac.zip`: MacOS Application (Zipped)

## Deployment Steps
1. **Test Locally**: Open the `.dmg` file and install the app to verify it works.
2. **Publish to GitHub**:
   - Push the code to GitHub.
   - Create a new Release tagged `v1.0.0`.
   - Upload these files as assets to the release.
   - `electron-updater` will check this GitHub repository for updates.

## Auto-Update
Auto-update is configured to check `https://github.com/yourusername/handsome-terminal`.
Update `package.json` with your actual repository URL before publishing if different.
