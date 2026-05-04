# Branching And Releases

## Branches

- `main`: protected release branch.
- `dev`: integration branch for internal testing.
- `feature/*`: short-lived implementation branches.

Pull requests should target `dev` during active MVP development. Release candidates are promoted from `dev` to `main`.

## Required Checks

Pull requests should pass:

- install
- lint
- typecheck
- tests
- build

## Release Flow

Create a version tag from `main`:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow builds the Windows desktop distributable and attaches it to a GitHub Release.
