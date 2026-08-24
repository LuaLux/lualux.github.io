---
sidebar_position: 4
title: "Project Configuration"
description: "How a Lux project is laid out, the lux.toml fields you touch most, and how lux build and lux run behave."
---

# Project Configuration

Every Lux project is a directory with a `lux.toml` at its root. That file is what turns a folder of
`.lux` files into something the compiler, the package manager and the language server all agree on.

## Project layout

`lux init` produces the conventional shape:

```
my-app/
├── lux.toml            # project config
├── src/                # .lux sources, compiled recursively
│   └── main.lux
├── out/                # generated .lua, safe to delete and gitignore
└── lux_modules/        # installed dependencies, created by lux install
```

Nothing here is hardcoded. `source` and `output` are configurable, and the compiler mirrors the
directory structure of `source` into `output`, so `src/animals/cat.lux` becomes
`out/animals/cat.lua`.

## The fields you will actually set

```toml title="lux.toml"
name = "my-app"                 # package name, used by the package manager
version = "0.1.0"               # semver, used when this package is a dependency
target = "5.4"                  # 5.1, 5.2, 5.3, 5.4, jit
source = "src"                  # root of your .lux files
output = "out"                  # where the .lua goes
entry = "src/main.lux"          # what `lux run` and `lux compile` start from
minify = false                  # strip whitespace from the output
generate_declarations = true    # also emit .d.lux type definitions
```

`name`, `source` and `output` are the only ones most projects need. The rest have sensible defaults.

### entry

`entry` names the file that is the program. `lux run` and `lux compile` need it. If you leave it
out, `lux run` falls back to looking for `main.lua`, `index.lua` or `init.lua` in the output
directory.

Libraries usually have no `entry` at all, because they are imported rather than executed.

### generate_declarations

When true, the compiler writes a `.d.lux` file alongside the compiled Lua describing the public
types of the project. Other Lux projects that depend on this one read that file to type-check calls
into it. Turn it on for libraries, and leave it off for applications that nobody imports.

See [declaration files](../language/declarations.md) for the format.

## Building

```bash
lux build
```

Reads `lux.toml`, compiles every `.lux` under `source`, and writes the result under `output`. If any
file fails to compile, nothing is written. A partially compiled project is never left on disk.

You can also compile specific files without a full project:

```bash
lux build src/foo.lux src/bar.lux
```

In this mode the compiler still picks up a `lux.toml` if one is next to the files, so your target
and code options still apply.

## Running

```bash
lux run                  # compile the project and execute `entry`
lux run src/scratch.lux  # compile and run one file, output goes to a temp dir
lux run -- alpha beta    # forward arguments to the script via the global `arg` table
```

`lux run` uses the Lua 5.4 interpreter embedded in the `lux` binary, so it works on a machine with
no Lua installed. Imports resolve through Lua's normal `require`, with the compiled output directory
prepended to `package.path` before the entry script runs.

In single-file mode the compiled Lua is written to a temporary directory and cleaned up afterwards.
Use `lux build` when you want the output to stick around.

:::note
The embedded interpreter is always Lua 5.4, regardless of your `target`. If you target `5.1` or
`jit`, `lux run` is a convenience for iterating, not a substitute for testing on the real runtime.
Compile with `lux build` and run the output under the actual interpreter before shipping.
:::

## Watching

```bash
lux watch
lux watch --debounce 150
```

Recompiles the whole project on every change under `source`, debouncing bursts of saves. Compile
errors print and the watcher keeps going. Each rebuild re-reads `lux.toml`, so changing the target
or the output path takes effect without a restart.

Unlike `lux build`, the watcher does **not** run `[scripts]` hooks, so side-effecting pre- and
post-build commands do not fire on every keystroke.

## Config inheritance and presets

Projects in a monorepo can share a base config:

```toml title="lux.toml"
extends = ["./base.toml"]
preset = "strict"                # "strict" or "relaxed"
globals = ["lib/engine.d.lux"]   # declaration files loaded into every compilation
```

`extends` merges parent files in order, with the local file winning on conflicts. It chains
transitively, up to a depth of ten.

`preset = "strict"` turns on the stricter rules in one line: no implicit `any`, strict nil checking,
immutable-by-default variables and explicit exhaustive matching. You can still override individual
rules underneath it.

`globals` points at `.d.lux` files whose declarations are visible everywhere without an import. This
is how you type a host environment, such as a game engine that injects globals into every script.

## Everything else

`lux.toml` also has `[code]`, `[rules]`, `[mangle]`, `[scripts]`, `[install]`, `[test]`, `[sides]`
and `[reflection]` sections. They control indexing base, operator aliases, nil strictness,
minification, build hooks and more.

Those are documented key by key in the
[configuration reference](../advanced/configuration.md).
