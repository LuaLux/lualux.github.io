---
sidebar_position: 1
slug: /
title: "Introduction"
description: "What Nebra is, what it compiles to, and how to find your way around the documentation."
---

# Introduction

Nebra is a typed superset of Lua. You write `.neb` files, the compiler checks them and emits plain
Lua that any Lua 5.1, 5.2, 5.3, 5.4 or LuaJIT runtime can load. Nothing about Nebra exists at run
time: there is no runtime library to ship, no metatable shim, no type information in the output.

```nebra title="src/main.neb"
class Greeter
    name: string

    constructor(name: string)
        self.name = name
    end

    function greet(): string
        return "Hello, " .. self.name .. "!"
    end
end

local greeter = new Greeter("world")
print(greeter:greet())
```

```lua title="out/main.lua"
local Greeter = {}
Greeter.__index = Greeter
Greeter.__name = "Greeter"
function Greeter.new(name)
	return setmetatable({
		name = name
	}, Greeter)
end
function Greeter:greet()
	return "Hello, " .. self.name .. "!"
end
local greeter = Greeter.new("world")
print(greeter:greet())
```

## The two rules Nebra is built on

**Every valid Lua program is a valid Nebra program.** You can rename a `.lua` file to `.neb` and it
compiles. There is no rewrite step and no all-or-nothing migration. Types are opt-in per variable,
per function and per file.

**Everything is lowered at compile time.** Classes become tables with metatables. Generics are
erased. `async`/`await` becomes coroutines. Pattern matching becomes if-chains. Imports become
`require` calls. If you can read the Lua that comes out, you can debug it, profile it and drop it
into any existing project.

## What you get on top of Lua

| Area | What Nebra adds |
|------|---------------|
| Types | Primitives, unions, arrays, maps, structs, tuples, generics, type predicates, a `never` bottom type |
| Nil safety | `?` nullable types, `??`, `!`, `?.`, flow narrowing, and an optional strict-nil mode |
| Structure | Classes with inheritance and access control, interfaces with default methods, enums |
| Control flow | `match` statements and expressions, `guard`, `defer`, `continue`, `break N` |
| Concurrency | `async` functions and `await`, lowered onto coroutines |
| Modules | ES-style `import`/`export` with cross-file type resolution and unused-import stripping |
| Metaprogramming | Compile-time annotations that rewrite the IR, plus opt-in runtime reflection |
| Tooling | Compiler, REPL, test runner, package manager, docs generator, native bundler, language server |

## Where to go next

If you have not installed anything yet, start with the
[installation guide](./getting-started/installation.md), then walk through the
[quick start](./getting-started/quick-start.md) to compile and run your first project.

If you want to see the language before committing to anything, the
[examples](./examples/overview.md) are complete programs you can read top to bottom.

If you are already writing Nebra and want a specific answer, the
[language reference](./language/types.md) covers each feature in its own page, and the
[nebra.toml reference](./advanced/configuration.md) documents every configuration key.

## A note on reading the docs

Code blocks marked `nebra` are Nebra source. Code blocks marked `lua` are compiler output or plain Lua
being described. Where a page shows both, the Nebra block comes first and the generated Lua follows,
so you can always see what a feature actually costs.
