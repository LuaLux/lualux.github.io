---
sidebar_position: 2
title: "Package Manager"
description: "Dependency specs, the install pipeline, the registry, lockfiles and lifecycle scripts."
---

# Package Manager

Nebra ships with a built-in package manager modeled after npm / cargo, with git as the source of truth. Dependencies are declared in `nebra.toml`, fetched from git, and linked into a local `nebra_modules/` folder. There is no central registry server - just an optional **alias registry** (a JSON file in this repo) that maps short names to git URLs.

---

## Declaring dependencies

`nebra.toml` has three dependency tables:

```toml
[dependencies]
# String spec
nebra-strings = "github:DasDarki/nebra-strings@v1.2.0"

# Inline table - same fields as a [packages.<name>] block
lua-math = { git = "https://example.com/lua-math.git", tag = "v0.5.0" }

# Local checkout for development
my-utils = "file:../my-utils"

[dev-dependencies]
# Only installed when --no-dev is not set
nebra-bench = "github:DasDarki/nebra-bench@v0.3.0"

[peer-dependencies]
# Required by libraries, not auto-installed
nebra-core = ">=1.0.0"
```

---

## Specifier formats

| Format                                | Resolves to                                          |
|---------------------------------------|------------------------------------------------------|
| `name@version`                         | Registry alias → git URL + ref `vX.Y.Z`             |
| `github:owner/repo`                    | `https://github.com/owner/repo.git`                  |
| `github:owner/repo@v1`                 | `https://github.com/owner/repo.git#v1`               |
| `github:owner/repo/sub/dir@v1`         | One package inside a monorepo (sparse-checked subdir)|
| `gh:owner/repo[@ref]`                  | Shorthand for `github:...`                           |
| `https://example.com/foo.git`          | Direct git URL, default branch                       |
| `https://example.com/foo.git#v1.0`     | Direct git URL, specific ref                         |
| `file:../local-path`                   | Symlink / copy of a local directory                  |
| `{ git = "...", tag = "v1" }`          | Inline table form, same fields as the spec strings   |
| `{ git = "...", branch = "main" }`     | Branch instead of tag                                |
| `{ git = "...", rev = "abc1234" }`     | Specific commit SHA                                  |
| `{ git = "...", subdir = "pkgs/x" }`   | Package living in a subdirectory of the repo         |

A ref can be a branch, a tag, or a commit SHA. Tags are preferred for reproducibility.

### Monorepos (multiple packages in one repo)

When a repository hosts more than one Nebra package, name the package's subdirectory so the
resolver knows which one to add. Any path segments after `owner/repo` in a host shortcut
become the in-repo subdirectory, or you can spell it out with the `subdir` key:

```bash
nebra add github:owner/monorepo/packages/math@v1
```

```toml
[dependencies]
math = { git = "https://github.com/owner/monorepo.git", tag = "v1", subdir = "packages/math" }
```

Nebra sparse-checks only that subdirectory into the store and reads **its** `nebra.toml` to
determine the dependency name and its own transitive dependencies. The same repo can be
added multiple times pointing at different subdirectories.

---

## Adding / removing

```bash
nebra add github:DasDarki/nebra-strings@v1.2.0
nebra add lua-math@0.5.0 --dev
nebra remove lua-math
```

`nebra add` mutates `nebra.toml` via a roundtrip TOML parser (Tomlyn `DocumentSyntax`) - **your formatting and comments are preserved**. If the resulting spec is ambiguous with an inline-table form already present, the inline table is upgraded; otherwise a string form is appended.

After mutation, the installer runs - you get the new package in `nebra_modules/` immediately.

---

## The install pipeline

`nebra install` (or `nebra add`'s implicit install) runs five stages:

1. **Resolve** - every spec is normalized into a `(name, gitUrl, ref)` triple. Registry aliases are looked up against the alias registry (cached at `~/.neb/registry/index.json`, refresh with `nebra registry refresh`).
2. **Fetch** - each unique `(gitUrl, ref)` is fetched into a bare-clone cache at `~/.neb/cache/git/<hash>/`. Subsequent fetches reuse the cache. Use `--no-cache` to force a fresh clone.
3. **Materialize** - each package is checked out into the **store** at `~/.neb/store/<name>@<resolved-ref>/`.
4. **Link** - the store directory is linked into `<project>/nebra_modules/<name>/`. On Linux/macOS this is a symlink; on Windows it's a junction (or a copy on filesystems that don't support junctions).
5. **Transitive resolve** - the freshly installed package's own `nebra.toml` is read; its `[dependencies]` are processed the same way. Versions are de-duplicated by `(name, resolved-ref)`.

Output:

```
$ nebra install
  resolved nebra-strings -> github:DasDarki/nebra-strings@v1.2.0
  resolved lua-math    -> file:../lua-math@
Installed 2 package(s) into nebra_modules/.
```

---

## The lockfile (`nebra.lock`)

After every successful install, Nebra writes `nebra.lock` next to `nebra.toml`. It pins every transitively-resolved `(name, git, ref, commit, integrity)` tuple. Commit it to source control - `nebra install --frozen` (CI mode) refuses to drift from the lockfile.

```toml
# nebra.lock v1
version = 1

[[package]]
name = "nebra-strings"
git = "https://github.com/DasDarki/nebra-strings.git"
ref = "v1.2.0"
commit = "abcdef1234..."
integrity = "sha256-..."

[[package]]
name = "lua-math"
git = "file:/path/to/lua-math"
```

---

## Conflict resolution + name aliases

When two packages depend on the same name at incompatible refs, the **alias registry** is consulted. If the registry has a canonical entry for the conflicting name, the dependency tree may be rewritten to use `@scope/name` form to disambiguate:

```toml
# Original
nebra-fancy = "github:fork-a/nebra-fancy@v2.0.0"
# But a transitive dep wants github:fork-b/nebra-fancy@v1 - registry maps both to a scope:
# Nebra rewrites:
"@a/nebra-fancy" = "github:fork-a/nebra-fancy@v2.0.0"
"@b/nebra-fancy" = "github:fork-b/nebra-fancy@v1.0.0"
```

If no scope mapping exists, the install fails with a clear message and a suggestion to manually use `@scope/name` syntax.

---

## How dependencies are seen by the compiler

After install, the compiler discovery (Phase 4) walks `nebra_modules/`:

- Every `<pkg>/init.neb` or `<pkg>/init.lua` becomes the entry for `import { x } from "<pkg>"`.
- Every `<pkg>/<sub>.neb` (or `.lua`) becomes addressable as `import { x } from "<pkg>/<sub>"`.
- `.d.neb` files in any installed package are loaded as type-only declarations - their types become available to the type checker, but no Lua code is generated for them.
- Each package's own `[scripts]` annotations are loaded (provided you used `--allow-scripts`).

This means a pure-Lua package can ship without any Nebra source - just a `.lua` entry point and an `.d.neb` next to it (the [`examples/lua-math/`](https://github.com/nebra-lang/nebra/tree/master/examples/lua-math) example shows the pattern).

---

## Lifecycle scripts

A dependency can declare scripts in its own `nebra.toml`:

```toml
# In nebra_modules/foo/nebra.toml
[scripts]
install = ["echo 'building native helpers...'", "make native"]
postinstall = ["./scripts/copy-assets.sh"]
```

These are **disabled by default** - Nebra does not run arbitrary code from dependencies unless you opt in:

```bash
nebra install --allow-scripts            # allow all
nebra install --allow-scripts=foo,bar    # allow only specific packages
```

This mirrors npm's `--ignore-scripts` default-flipped to safe-by-default. Trusted internal mirrors can set `[install].allow_scripts = true` in the project's own `nebra.toml` to suppress the per-invocation flag.

---

## Publishing your own package

There is no central package server. To publish a Nebra library, just push a git repo:

1. Have a `nebra.toml` at the root with `name`, `version`, optional `[dependencies]`.
2. Either ship `.neb` sources (run through the consumer's compiler) or pre-built `.lua` + `.d.neb` (faster install, no consumer needs to recompile yours).
3. Tag releases as `vX.Y.Z`.
4. Users add it with `nebra add github:you/your-lib@vX.Y.Z`.

If you want a friendly short name, open a PR against the alias registry to map `your-lib` to `github:you/your-lib`. After that, users can `nebra add your-lib@1.2.0` without typing the org.

---

## Caches & file locations

| Path                                  | Purpose                                              |
|---------------------------------------|------------------------------------------------------|
| `~/.neb/cache/git/<hash>/`            | Bare-clone cache, deduplicated per git URL           |
| `~/.neb/store/<name>@<ref>/`          | Materialized checkout, shared across projects        |
| `~/.neb/registry/index.json`          | Alias registry cache (refreshed by `nebra registry refresh`) |
| `<project>/nebra_modules/<name>/`       | Link to the store; what the compiler reads from      |
| `<project>/nebra.lock`                  | Pinned resolution; commit this                       |

Delete `~/.neb/cache/` to fully reset the fetch cache; `~/.neb/store/` to also reset materialized checkouts.
