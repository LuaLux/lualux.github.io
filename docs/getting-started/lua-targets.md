---
sidebar_position: 5
title: "Lua Targets"
description: "Which Lua dialect the compiler emits, what each version supports natively, and what Lux polyfills for you."
---

# Lua Targets

One Lux codebase can compile for five different Lua runtimes. You pick the target once in
`lux.toml` and the compiler adapts its output, emitting native syntax where the runtime has it and a
polyfill where it does not.

```toml title="lux.toml"
target = "5.4"   # 5.1, 5.2, 5.3, 5.4, jit
```

If you leave `target` out, the compiler defaults to `5.4`.

## Feature matrix

This is what each runtime provides on its own. Anything marked "polyfilled" still works in your Lux
source, it just compiles to different Lua.

| Feature | Lua 5.1 | Lua 5.2 | Lua 5.3 | Lua 5.4 | LuaJIT |
|---------|---------|---------|---------|---------|--------|
| `goto` and labels | polyfilled | native | native | native | native |
| Floor division `//` | polyfilled | polyfilled | native | native | polyfilled |
| Bitwise operators | polyfilled | polyfilled | native | native | `bit` library |
| Integer subtype | no | no | yes | yes | no |
| `<const>` locals | polyfilled | polyfilled | polyfilled | native | polyfilled |
| `<close>` locals | polyfilled | polyfilled | polyfilled | native | polyfilled |
| `table.unpack` | `unpack` | native | native | native | `unpack` |

`continue` does not exist in any Lua version. Lux always lowers it, using `goto` on runtimes that
have it and a restructured loop on Lua 5.1.

## What polyfilling looks like

The compiler never asks you to write different code per target. It rewrites at codegen time.

Floor division on a runtime without `//`:

```lux title="source"
local half = total // 2
```

```lua title="target 5.1"
local half = math.floor(total / 2)
```

Bitwise operations on LuaJIT, which has the `bit` library rather than operators:

```lux title="source"
local masked = flags & 0xFF
```

```lua title="target jit"
local masked = bit.band(flags, 0xFF)
```

`continue` on Lua 5.1, which has neither `continue` nor `goto`:

```lux title="source"
for _, v in ipairs(items) do
    if v == nil then continue end
    process(v)
end
```

```lua title="target 5.1"
for _, v in ipairs(items) do
  repeat
    if v == nil then break end
    process(v)
  until true
end
```

## Choosing a target

**`5.4`** is the right default for new standalone projects. It has the most native syntax, so the
output is the closest to what you wrote.

**`jit`** is what you want for performance-sensitive work or anything embedding LuaJIT. Note that
LuaJIT tracks Lua 5.1 semantics with extensions, so it has `goto` and bitwise operations but no
floor division operator and no integer subtype.

**`5.1`** is the safest choice for maximum compatibility. Many embedded hosts, game engines and
older frameworks are still on 5.1 or on a 5.1-compatible fork. Everything in Lux works here, it just
produces slightly more verbose output for the newer operators.

**`5.2`** and **`5.3`** are for hosts that pin those specific versions.

If you are compiling a library that other people will consume on unknown runtimes, target `5.1`. The
output runs everywhere, including on 5.4.

## Integer semantics

Lua 5.3 and 5.4 distinguish integers from floats. Lua 5.1, 5.2 and LuaJIT do not: every number is a
double.

Lux does not model this distinction in its type system. `number` is a single type covering both, and
the runtime decides. This is deliberate, because it keeps the same source compiling for every
target. If your program depends on integer overflow behaviour or on `math.type`, it is only portable
across the runtimes that agree on it.

## Verifying the output

The compiler will not stop you from reading what it produced, and you should:

```bash
lux build
cat out/main.lua
```

To check a target actually runs on the real interpreter rather than the embedded one, compile and
then invoke that interpreter directly:

```bash
lux build
lua5.1 out/main.lua
luajit out/main.lua
```

## Related

- [Project configuration](./project-configuration.md) covers the rest of `lux.toml`.
- The [full configuration reference](../advanced/configuration.md) documents every key, including
  the `[code]` section that changes indexing and operator behaviour.
- [Native binaries](../toolchain/native-binaries.md) bundles a project plus a runtime into a single
  executable, which sidesteps the target question entirely for end users.
