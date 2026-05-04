# Desktop Downloads

Internal users download the Windows desktop app from GitHub Releases.

## User Download Path

1. Open the repository in GitHub.
2. Go to **Releases**.
3. Open the latest `Inumaki AI` release.
4. Download the Windows installer asset named like `Inumaki-AI-0.1.0-x64.exe`.
5. Run the installer.

## Maintainer Release Path

Create a release in either of these ways:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Or run the **Release** workflow manually from GitHub Actions and provide a version such as `v0.1.0`.

The workflow builds the Electron app on `windows-latest`, uploads the installer as a workflow artifact, and attaches the same files to the GitHub Release assets.

## Local Windows Package

Maintainers can build the Windows installer locally with:

```bash
pnpm dist:win
```

The local installer output is written to:

```text
apps/desktop/release/
```

## API Endpoint

The desktop app defaults to `http://127.0.0.1:4141`. For internal user downloads, make sure one of these is true:

- the backend API is available at the default local URL, or
- users launch the app with `INUMAKI_API_BASE_URL` pointing at the internal API, or
- a later release adds a packaged/default internal API URL.
