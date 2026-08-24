---
sidebar_position: 5
title: "Typing Existing Lua"
description: "Wrap a plain .lua library in a .d.lux declaration so Lux callers get full type checking without rewriting a line of it."
---

# Typing Existing Lua

You almost never start from nothing. There is a Lua library you depend on, or a game engine that
injects globals into every script, and rewriting it is not on the table.

Declaration files solve this. A `.d.lux` file describes the types of code that already exists. It
generates no output, it is never required at run time, and the implementation stays exactly where it
was.

## The library, untouched

This is `examples/lua-math/init.lua`, ordinary Lua with no Lux anywhere in it:

```lua title="lua-math/init.lua"
local M = {}

--- Linear interpolation between a and b at parameter t in [0, 1].
function M.lerp(a, b, t)
    return a + (b - a) * t
end

--- Clamps x into the closed interval [lo, hi].
function M.clamp(x, lo, hi)
    if x < lo then return lo end
    if x > hi then return hi end
    return x
end

--- Returns the sum of all numeric arguments passed in.
function M.sum(...)
    local args = { ... }
    local total = 0
    for i = 1, #args do
        total = total + args[i]
    end
    return total
end

return M
```

## The declaration

Alongside it, `init.d.lux` describes what callers can rely on:

```lux title="lua-math/init.d.lux"
declare module "lua-math"
    interface Vec2
        x: number
        y: number
    end

    --- Linear interpolation between `a` and `b` at parameter `t in [0, 1]`.
    ---@param a start value
    ---@param b end value
    ---@param t interpolation factor
    function lerp(a: number, b: number, t: number): number

    --- Clamps `x` into the closed interval `[lo, hi]`.
    function clamp(x: number, lo: number, hi: number): number

    --- Variadic sum of every argument, all expected to be numbers.
    function sum(...: number): number

    --- Mean of `values`. Returns `0` when `values` is empty.
    function average(values: number[]): number

    --- Builds a Vec2 table with the given coordinates.
    function vec2(x: number, y: number): Vec2

    --- Magnitude of a Vec2 produced by `vec2`.
    function length2(v: Vec2): number
end
```

The `declare module "lua-math"` block is matched by name. When a consumer writes
`import { lerp } from "lua-math"`, the type checker reads this file while the generated Lua still
resolves to the real `init.lua` at run time.

## What the caller gets

```lux
import { lerp, clamp, vec2, length2 } from "lua-math"

local mid: number = lerp(0, 10, 0.25)      -- 2.5
local capped: number = clamp(140, 0, 100)  -- 100

local origin = vec2(3, 4)
print(length2(origin))                      -- 5.0

lerp("zero", 10, 0.25)                      -- error: expected 'number', but got 'string'
local bad: number = origin                  -- error: expected 'number', but got 'Vec2'
```

Full checking, hover types, completion and go-to-definition, over a library that has no idea Lux
exists.

## The three ways to declare things

### Globals

For a host environment that injects values into every script, declare them at the top level of a
`.d.lux` and list the file under `globals` in `lux.toml`:

```lux title="engine.d.lux"
declare _VERSION: string
declare function print(...: any): nil

declare interface Vector
    x: number
    y: number
    function length(self: Vector): number
end

declare Vec: Vector
```

```toml title="lux.toml"
globals = ["engine.d.lux"]
```

Everything in there is now visible everywhere without an import.

### Modules

Use `declare module "name"` when the thing is required rather than global, as in the `lua-math`
example above.

### Generated declarations

If your project is itself a library, let the compiler write the declaration for you:

```toml title="lux.toml"
generate_declarations = true
```

Every build then emits a `.d.lux` next to the compiled Lua, describing the public surface of the
package. Consumers get types with no hand-written file to maintain.

```lux title="out/my-lib.d.lux"
declare module "my-lib"
    declare function greet(name: string): string
    declare function panic(reason: string): never
end
```

## Declaring around Lua's keyword collisions

A handful of Lua identifiers collide with Lux keywords, `string.match` being the common one. Those
cannot be declared as members directly. Reach them with bracket access at the call site instead:

```lux
local m = string["match"](line, "^(%w+)")
```

## Practical notes

**Start loose and tighten later.** A parameter you are unsure about can be `any`. That is still
better than nothing, because the arity is checked even when the types are not.

**Declaration files never emit code.** You can be as detailed as you like without paying for it. The
`interface Vec2` above exists purely so `vec2` and `length2` agree on a shape.

**Doc comments carry over.** The `---` comments in a `.d.lux` show up on hover for consumers and in
generated documentation, so a good declaration file doubles as the library's reference.

## Next

- [Declaration files](../language/declarations.md) is the complete reference for the `.d.lux` syntax.
- [Sides](../advanced/sides.md) shows how to scope declarations to client, server or shared, which
  matters when you are typing a multiplayer game host.
- [Modules and packages](./modules-and-packages.md) puts a declared library into a real project.
