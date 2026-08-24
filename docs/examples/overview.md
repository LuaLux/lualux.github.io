---
sidebar_position: 1
title: "Overview"
description: "Complete, runnable Lux programs, from a first script to a three-package project that spans Lux and plain Lua."
---

# Examples

Every example on these pages is a real program that compiles and runs. The sources live in the
[`examples/` directory](https://github.com/LuaLux/lux/tree/master/examples) of the Lux repository,
so you can clone it and run each one yourself:

```bash
git clone https://github.com/LuaLux/lux.git
cd lux/examples/zoo-app
lux install
lux run
```

## What each example covers

| Example | What you learn |
|---------|----------------|
| [Hello, typed world](./hello-world.md) | The smallest useful program: annotations, doc comments, and what the compiler strips |
| [Classes and interfaces](./classes-and-interfaces.md) | Modelling behaviour with `interface`, `class`, `implements` and arrays of a shared type |
| [Modules and packages](./modules-and-packages.md) | Local imports, folder modules, sub-modules and file dependencies across three packages |
| [Typing existing Lua](./typing-existing-lua.md) | Wrapping a plain `.lua` library in a `.d.lux` so callers get types without a rewrite |
| [Compile-time annotations](./annotations.md) | Writing an annotation that rewrites the IR before codegen |

## Reading order

If you are new to Lux, take them in the order above. Each one builds on the previous, and the last
two are the ones that have no equivalent in plain Lua.

If you already know what you are looking for, the [language reference](../language/types.md) is
organised by feature rather than by narrative.

## The repository examples

The pages here are written to be read on their own, but they are drawn from four projects that are
also useful to browse directly:

**`examples/lux-strings`** is a small library written entirely in Lux. It exports string helpers
from `init.lux` and has a sub-module in `case.lux`, so it demonstrates how a package exposes both a
root entry point and addressable sub-modules.

**`examples/lua-math`** is the opposite: a library written in plain Lua with a hand-written
`init.d.lux` that describes its types. Nothing about it was rewritten for Lux.

**`examples/zoo-app`** consumes both of the above through the package manager, plus local sibling
files and a folder module of its own. It is the end-to-end test of the import system.

**`examples/annotation-demo`** defines a `@log` annotation and applies it to three functions,
showing the compile-time metaprogramming pipeline from definition to generated output.
