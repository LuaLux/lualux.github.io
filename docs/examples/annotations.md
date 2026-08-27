---
sidebar_position: 6
title: "Compile-Time Annotations"
description: "Write an annotation that rewrites the compiler's IR before codegen, and see exactly what it produces."
---

# Compile-Time Annotations

An annotation is a function that runs **inside the compiler**. It receives a declaration as a data
structure, rewrites it, and hands it back. The rest of the pipeline then proceeds as if you had
written the modified version by hand.

This is the one Nebra feature with no runtime cost *and* no runtime presence. There is no decorator
object, no wrapper closure, no registry. Whatever the annotation produces is simply what gets
compiled.

## The example

This is `examples/annotation-demo` from the
[repository](https://github.com/nebra-lang/nebra/tree/master/examples/annotation-demo). The `@log`
annotation prepends a `print` to the body of every function it decorates.

### Registering the directory

```toml title="nebra.toml"
annotations = ["annotations"]

[code]
index_base = 1
```

`annotations = [...]` lists the directories the compiler scans. Every `.neb` file in there that
exports an `annotation` table and an `apply` function becomes available as `@name`, where `name` is
the file name.

### The definition

```nebra title="annotations/log.neb"
export local annotation = {
    target = "Function",
    params = {
        message = { type = "string", required = false }
    }
}

--- Receives the target FunctionDecl as a Lua table (camelCased property
--- names, `__kind = "FunctionDecl"`) and the validated `args` dictionary.
--- Returns the modified declaration; the compiler replaces the original
--- in-place with what we hand back.
export function apply(target, args)
    local fnName = target.namePath[1].name
    local label = args.message or fnName
    local logStmt = ir.exprStmt(ir.call("print", {
        ir.stringLiteral("[log] " .. label)
    }))
    table.insert(target.body, 1, logStmt)
    return target
end
```

Two exports are required:

**`annotation`** is the metadata. `target` says what kind of declaration this can be applied to, and
`params` declares the arguments with their types and whether they are required. The compiler
validates call sites against this before `apply` ever runs, so a typo in an argument name is a
compile error rather than a nil at rewrite time.

**`apply(target, args)`** is the rewrite. `target` is the declaration encoded as a plain Lua table,
`args` is the validated arguments, and the return value replaces the original node.

The `ir` global provides constructors for IR nodes: `ir.exprStmt`, `ir.call`, `ir.stringLiteral` and
so on. You are building the same tree the parser would have built.

### Using it

```nebra title="src/main.neb"
@log
function greet(name: string): string
    return "Hello, " .. name .. "!"
end

@log("computing sum")
function add(a: number, b: number): number
    return a + b
end

@log(message = "stringifying number")
function describe(n: number): string
    return "the number is " .. tostring(n)
end

print(greet("Nebra"))
print("2 + 3 =", add(2, 3))
print(describe(42))
```

All three call forms are supported: bare, positional, and named.

```bash
nebra run
```

```
[log] greet
Hello, Nebra!
[log] computing sum
2 + 3 =	5
[log] stringifying number
the number is 42
```

## What the compiler emits

```lua title="out/main.lua"
function greet(name)
	print("[log] greet")
	return "Hello, " .. name .. "!"
end
function add(a, b)
	print("[log] computing sum")
	return a + b
end
function describe(n)
	print("[log] stringifying number")
	return "the number is " .. tostring(n)
end
print(greet("Nebra"))
print("2 + 3 =", add(2, 3))
print(describe(42))
```

The `print` calls are simply part of the function bodies. There is no trace of `@log` at all, and
nothing at run time knows an annotation was involved.

:::note
This output has `[reflection] mode = "none"` set. With the default `mode = "all"`, a reflection
metadata block is also emitted. See [Reflection](../advanced/reflection.md).
:::

## When to reach for this

Annotations are worth it when the alternative is boilerplate you would otherwise write by hand in
many places:

- **Registration.** `@route("/users")`, `@command("kick")`, `@eventHandler` all want to append a
  registration call next to the declaration.
- **Instrumentation.** Timing, logging and tracing wrappers, added without a runtime decorator.
- **Deprecation.** `@deprecated("use bar instead")` can emit a compile-time warning at every call
  site.
- **Generated members.** Deriving equality, serialisation or builders from a class shape.

They are the wrong tool when a plain higher-order function would do. An annotation runs at compile
time and cannot see runtime values.

## Debugging an annotation

Because `apply` is ordinary Nebra code running in the compiler, you can `print` from it. Output shows
up during compilation, not at run time. If the rewritten IR is malformed, the compiler reports it
against the annotation rather than crashing:

```
error[E500C]: Annotation '@log' returned malformed IR: ...
```

## Next

- [Annotations](../advanced/annotations.md) is the full reference: the builtin annotations, every
  `target` kind, the complete `ir` constructor set, and the encoding of each declaration type.
- [Reflection](../advanced/reflection.md) is the run-time counterpart. Annotations rewrite before
  codegen, reflection describes types after it.
