# README — kjsing's mo setup (HTML viewer + tree defaults)

Personal setup/reproduction guide for my customized build of mo. The upstream
project README is in `README.md`; this file documents **my fork and how to
rebuild it on my systems**.

This is a fork of [`k1LoW/mo`](https://github.com/k1LoW/mo) on branch
`feature/html-viewer` that adds:

- **HTML viewing** — `.html`/`.htm` files render live in an `<iframe>` (instead
  of as syntax-highlighted source). Directory/glob scanning now picks up HTML too.
- **Sidebar defaults** — opens in **tree (folder) view** with **all folders
  collapsed** by default.

It builds like upstream (`make build`), but on a locked-down Amazon corp
network/host the stock toolchain fetch paths are blocked. The notes below
capture the exact workarounds used so the custom binary can be reproduced on
other systems.

## Prerequisites

| Tool | Version | Install note |
|------|---------|--------------|
| Go   | 1.24+   | `brew install go` |
| Node | **≥ 22.13** | `brew install node` (use brew/system Node) |
| pnpm | 10+     | `brew install pnpm` |

> ⚠️ **Do not use `nvm`-downloaded Node binaries on older hosts.** The official
> prebuilt Node binaries require a newer glibc than some Amazon dev hosts have
> (`GLIBC_2.27/2.28 not found`). Use the Homebrew-built Node, which links
> against Homebrew's own runtime. (`brew upgrade node` if yours is < 22.13.)

## Workaround 1 — npm registry (frontend deps)

The default npm registry here points at an Amazon CodeArtifact mirror whose auth
token is often expired (`401 Unauthorized`). This fork ships
`internal/frontend/.npmrc` pointing at the public registry and disabling pnpm's
"download the pinned package-manager version" behavior (that download also hits
the broken mirror):

```ini
# internal/frontend/.npmrc
registry=https://registry.npmjs.org/
manage-package-manager-versions=false
```

If `pnpm install` still tries to self-download `pnpm@<pinned>` from
CodeArtifact, force the public registry explicitly:

```bash
cd internal/frontend
npm_config_registry=https://registry.npmjs.org/ \
  pnpm install --registry=https://registry.npmjs.org/
```

## Workaround 2 — Go module proxy

`proxy.golang.org` is DNS-sinkholed on the corp network
(`certificate is valid for chalupa-dns-sinkhole...`). Fetch modules directly
from their source (GitHub / go.googlesource.com are reachable):

```bash
export GOPROXY=direct
export GOSUMDB=off
```

## Build steps

```bash
cd ~/code/mo

# 1. Frontend deps (see Workaround 1)
cd internal/frontend
npm_config_registry=https://registry.npmjs.org/ \
  pnpm install --registry=https://registry.npmjs.org/

# 2. Build the embedded SPA bundle.
#    Running the binaries directly avoids pnpm's package-manager self-download.
#    Output goes to ../static/dist, which is embedded via go:embed.
./node_modules/.bin/tsc        # type-check
./node_modules/.bin/vite build # bundle
cd ../..

# 3. Build the Go binary (see Workaround 2)
export PATH="$(brew --prefix)/bin:$PATH"   # ensure brew Go/Node win
export GOPROXY=direct GOSUMDB=off
go build \
  -ldflags="-s -w -X github.com/k1LoW/mo/version.Revision=$(git rev-parse --short HEAD)" \
  -trimpath -o mo .
```

The result is a self-contained `./mo` binary (the SPA is embedded; no CDN needed
at runtime).

## Running

```bash
./mo page.html               # open one HTML file (renders in an iframe)
./mo ~/some/dir              # open all .md/.html/.htm in a directory
./mo -R ~/some/dir           # recurse into subdirectories
./mo -t mygroup ...          # put files in a named group/tab (URL /mygroup)
./mo --status                # list running servers + their files
./mo --shutdown -p 6275      # stop the server on a port
```

Default server: `http://localhost:6275`. On a headless host the browser won't
auto-open (`xdg-open not found` is harmless) — reach it via your tunnel/forward.

## Tests

```bash
# Go
export GOPROXY=direct GOSUMDB=off
go test ./...

# Frontend (test-setup.ts polyfills localStorage for Node 22.13+/26)
cd internal/frontend
./node_modules/.bin/vitest run
```

## What changed vs upstream

| File | Change |
|------|--------|
| `internal/frontend/src/utils/filetype.ts` | `isHtmlFile()` helper |
| `internal/frontend/src/utils/resolve.ts` | `rawFileUrl()` for iframe `src` |
| `internal/frontend/src/components/MarkdownViewer.tsx` | render `.html` in an iframe (cache-busted src) |
| `internal/server/server.go` | raw HTML served with `frame-ancestors 'self'` + `Cache-Control: no-store` |
| `cmd/root.go` | directory/glob includes `*.{md,html,htm}` |
| `internal/frontend/src/App.tsx` | default sidebar view = `tree` |
| `internal/frontend/src/components/TreeView.tsx` | folders collapsed by default |
| `internal/frontend/src/test-setup.ts` | in-memory `localStorage` polyfill for the test env |
