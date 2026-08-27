---
sidebar_position: 4
title: "Modules and Packages"
description: "Local imports, folder modules, sub-modules and file dependencies, worked through a project that spans three packages."
---

# Modules and Packages

Lua has `require` and a search path. Nebra keeps that as the runtime mechanism and puts a real module
system on top, so imports resolve to files, types flow across the boundary, and unused imports get
stripped.

This example is the `zoo-app` project from the
[repository](https://github.com/nebra-lang/nebra/tree/master/examples), which exists specifically to
exercise every resolution path at once.

## The shape of it

```
examples/
├── nebra-strings/           # a library written in Nebra
│   ├── nebra.toml
│   ├── init.neb           # package root
│   └── case.neb           # sub-module
├── lua-math/              # a library written in plain Lua
│   ├── nebra.toml
│   ├── init.lua           # the actual implementation
│   └── init.d.neb         # hand-written types for it
└── zoo-app/               # the consumer
    ├── nebra.toml
    └── src/
        ├── main.neb
        ├── utils.neb      # sibling file
        └── animals/
            ├── init.neb   # folder module
            ├── cat.neb    # folder sub-module
            └── dog.neb
```

## Declaring dependencies

```toml title="zoo-app/nebra.toml"
name = "zoo-app"
version = "0.1.0"
target = "5.4"
source = "src"
output = "out"
entry = "main.neb"

[dependencies]
nebra-strings = "file:../nebra-strings"
lua-math = "file:../lua-math"
```

`file:` dependencies point at a directory on disk, which is what you want for a monorepo or while
developing a library and its consumer side by side. Git dependencies use the same table with a
different spec, covered in the [package manager guide](../toolchain/package-manager.md).

```bash
cd ../nebra-strings && nebra build    # the Nebra library needs its .lua files to exist
cd ../zoo-app && nebra install      # link the deps into nebra_modules/
nebra run
```

```
  > Welcome, Whiskers!
loud (95 dB)
quiet (120 dB)
|origin| = 5.0
lerp(0,10,0.25) = 2.5
sum(1..5) = 15
kinds => cat, dog
Whiskers   => meow
Rex        => woof
```

## Every import form in one file

```nebra title="src/main.neb"
import { trim, padLeft, startsWith } from "nebra-strings"
import { capitalize } from "nebra-strings/case"
import { lerp, clamp, sum, vec2, length2, Vec2 } from "lua-math"

import { formatLabel, padCols } from "utils"
import { Animal, kinds } from "animals"
import { Cat } from "animals/cat"
import { Dog } from "animals/dog"
```

Each line resolves differently:

| Import | How it resolves |
|--------|-----------------|
| `from "nebra-strings"` | Package root. Finds `nebra_modules/nebra-strings/init.lua`, types from the Nebra source. |
| `from "nebra-strings/case"` | Sub-module. A file inside the package, addressed with a slash. |
| `from "lua-math"` | A plain Lua package. Types come from `init.d.neb`, code from `init.lua`. |
| `from "utils"` | Sibling file `src/utils.neb`. No package-manager wiring needed. |
| `from "animals"` | Folder module. The directory has an `init.neb`, so that is the entry point. |
| `from "animals/cat"` | A file inside a local folder. |

The resolver tries local files first, then `nebra_modules`, then the globals declared in `nebra.toml`.

## Exporting

Only what you mark with `export` leaves a module:

```nebra title="src/utils.neb"
--- Joins a label and a value with a colon-arrow separator.
---@param label the leading word
---@param value the trailing description
---@return string the assembled line
export function formatLabel(label: string, value: string): string
    return label .. " => " .. value
end

--- Right-pads `s` with spaces until it reaches `width` columns.
export function padCols(s: string, width: number): string
    if #s >= width then return s end
    return s .. string.rep(" ", width - #s)
end
```

Anything without `export` is private to the file, which is a real improvement over the Lua
convention of building a table by hand and hoping you remembered everything.

## Folder modules

A directory with an `init.neb` is importable by the directory name. This is where you put the shared
types for a group of files:

```nebra title="src/animals/init.neb"
--- Common shape for every species shipped in this subpackage.
export interface Animal
    name: string
    function sound(): string
end

--- Display names of every species available under animals/.
export function kinds(): string[]
    return { "cat", "dog" }
end
```

Files inside the folder import from it by name, and the resolver walks up to the directory and back
in through `init.neb`:

```nebra title="src/animals/cat.neb"
import { Animal } from "animals"

export class Cat implements Animal
    name: string

    constructor(name: string)
        self.name = name
    end

    function sound(): string
        return "meow"
    end
end
```

Note that `Animal` is a type, not a value. Importing it costs nothing at run time: the import is
used only by the type checker, and the compiler drops it from the generated `require`.

## Types cross package boundaries

`Vec2` is declared in `lua-math`, a package with no Nebra source at all:

```nebra
declare module "lua-math"
    interface Vec2
        x: number
        y: number
    end

    function vec2(x: number, y: number): Vec2
    function length2(v: Vec2): number
end
```

In `zoo-app`, the round trip stays typed:

```nebra
local origin = vec2(3, 4)
print("|origin| = " .. tostring(length2(origin)))
```

`origin` is a `Vec2`. Passing it to something expecting a `number` is a compile error, even though
the value came out of a plain Lua function and goes straight back into another one. See
[typing existing Lua](./typing-existing-lua.md) for how that declaration is written.

## Next

- [Modules](../language/modules.md) is the full reference: default exports, namespace imports,
  side-effect imports and re-exports.
- [Package manager](../toolchain/package-manager.md) covers git dependencies, version resolution,
  the lockfile and lifecycle scripts.
- [Declaration files](../language/declarations.md) explains the `.d.neb` format.
