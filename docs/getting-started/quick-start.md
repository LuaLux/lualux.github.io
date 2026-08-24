---
sidebar_position: 2
title: "Quick Start"
description: "Create a Lux project, write your first typed module, compile it and run it. About five minutes end to end."
---

# Quick Start

This walkthrough takes you from an empty directory to a running program, and shows what the compiler
produces at each step. It assumes you have already
[installed the toolchain](./installation.md).

## Create a project

```bash
mkdir hello-lux && cd hello-lux
lux init
```

`lux init` writes three things and refuses to clobber an existing `lux.toml`:

```
hello-lux/
├── lux.toml       # project config
├── src/           # your .lux sources
├── out/           # generated .lua (gitignored)
└── .gitignore     # pre-populated with out/ and lux_modules/
```

The generated `lux.toml` is deliberately small. Everything else has a default:

```toml title="lux.toml"
name = "hello-lux"
version = "0.1.0"
target = "5.4"
```

`source` defaults to `src`, `output` defaults to `out`, and `target` decides which Lua dialect the
compiler emits. See [Lua targets](./lua-targets.md) for what changes between versions.

## Write some code

Create `src/main.lux`:

```lux title="src/main.lux"
--- Formats a greeting for a person.
---@param name who to greet
---@return string the assembled greeting
function greet(name: string): string
    return "Hello, " .. name .. "!"
end

print(greet("world"))
```

Two things are already happening that plain Lua would not do for you. The `: string` on the
parameter means passing a number is a compile error, not a runtime surprise. The `---` doc comments
are picked up by hover in the editor and by `lux docs`.

## Run it

```bash
lux run
```

```
Hello, world!
```

`lux run` compiles the project and executes it with the Lua 5.4 interpreter embedded in the binary.
Nothing needs to be installed on the machine for this to work.

If you only want the compiled output, use `lux build` instead. Either way, `out/main.lua` now
contains:

```lua title="out/main.lua"
function greet(name)
	return "Hello, " .. name .. "!"
end
print(greet("world"))
```

The type annotation is gone. That is the whole idea: types are a compile-time contract, and the
output is the Lua you would have written anyway.

## Watch the type checker work

Change the call to pass a number:

```lux
print(greet(42))
```

```bash
lux build
```

```
error[E2001]: expected 'string', but got 'number'
 --> src/main.lux:8:7
  |
8 | print(greet(42))
  |       ^^^^^^^^^
  = help: change the value to a 'string', adjust the annotation, or use 'as string' to assert the type
```

Nothing was written to `out/`. A failed build never emits partial output.

## Add a second module

Create `src/math_utils.lux`:

```lux title="src/math_utils.lux"
--- Clamps `value` into the inclusive range [`min`, `max`].
export function clamp(value: number, min: number, max: number): number
    if value < min then return min end
    if value > max then return max end
    return value
end

--- Averages a list of numbers. Returns 0 for an empty list.
export function average(values: number[]): number
    if #values == 0 then return 0 end
    local total: number = 0
    for _, v in ipairs(values) do
        total = total + v
    end
    return total / #values
end
```

Import it from `main.lux`:

```lux title="src/main.lux"
import { clamp, average } from "math_utils"

local scores: number[] = { 88, 94, 71, 100, 65 }

print("average: " .. tostring(average(scores)))
print("clamped: " .. tostring(clamp(140, 0, 100)))
```

```bash
lux run
```

```
average: 83.6
clamped: 100
```

The import lowers to a plain `require`, and the types of `clamp` and `average` flow across the file
boundary, so calling `average("nope")` is caught at compile time.

```lua title="out/main.lua"
local _mod0 = require("math_utils")
local clamp = _mod0.clamp
local average = _mod0.average
local scores = {
	88,
	94,
	71,
	100,
	65
}
print("average: " .. tostring(average(scores)))
print("clamped: " .. tostring(clamp(140, 0, 100)))
```

## Two defaults worth knowing about

Before you go further, there are two settings whose defaults surprise people coming from Lua. Both
are deliberate, and both are one line to change.

### Array indexing starts at 0

```toml title="lux.toml"
[code]
index_base = 0   # this is the default
```

With `index_base = 0`, Lux array literals and index expressions are 0-based in *your* source, and
the compiler shifts them to Lua's 1-based convention on the way out. `items[0]` compiles to
`items[0 + 1]`, and `ipairs` is replaced by a polyfill that yields 0-based indices.

That is convenient if you are coming from almost any other language, and jarring if you are coming
from Lua. To keep Lua semantics, say so explicitly:

```toml title="lux.toml"
[code]
index_base = 1
```

Pick one at the start of a project and do not change it later. Switching flips the meaning of every
index expression in the codebase.

### Reflection metadata is emitted by default

```toml title="lux.toml"
[reflection]
mode = "all"   # this is the default
```

Every build writes a runtime registry describing your classes, interfaces, enums, functions and
variables, so the [`reflect` library](../advanced/reflection.md) can look them up at run time. It is
genuinely useful for serialisation, dependency injection and plugin systems.

It also means the top of every generated file carries a metadata block you did not write. If you are
not using reflection, turn it off and the output gets noticeably smaller:

```toml title="lux.toml"
[reflection]
mode = "none"      # or "annotated" to only emit for types you mark
```

The compiled output shown throughout these docs was produced with `mode = "none"`.

## Rebuild on every save

While you are working, keep a watcher running in a second terminal:

```bash
lux watch
```

It recompiles the whole project whenever a `.lux` file changes, debounces bursts of saves, prints
errors without exiting, and reloads `lux.toml` on every rebuild so config changes take effect live.

## Where to go from here

- [Editor setup](./editor-setup.md) gets you diagnostics, hover types and completion while you type.
- [Project configuration](./project-configuration.md) explains the rest of `lux.toml`.
- The [type system](../language/types.md) is the natural next read, followed by
  [classes](../language/classes.md) and [modules](../language/modules.md).
- The [examples](../examples/overview.md) are complete programs, including one that spans three
  packages.
