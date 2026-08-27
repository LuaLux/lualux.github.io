---
sidebar_position: 13
title: "Async / Await"
description: "Coroutine-based async functions and how await lowers to plain Lua."
---

# Async / Await

Nebra supports async functions that compile to Lua coroutines.

## Async Functions

```nebra
async function fetchData(url: string): string
    local response = await httpGet(url)
    return response
end
```

## Async Methods

```nebra
class ApiClient
    async function get(url: string): string
        return await httpRequest("GET", url)
    end

    async function post(url: string, body: string): string
        return await httpRequest("POST", url, body)
    end
end
```

## Anonymous Async Functions

```nebra
local handler = async function(x: number): number
    local result = await compute(x)
    return result * 2
end
```

## Await

`await` can only be used inside `async` functions. It suspends execution until the awaited operation completes.

```nebra
async function multiStep(): string
    local a = await fetch("url1")
    local b = await fetch("url2")
    return a .. b
end
```

## How It Compiles

### Async Function

An async function wraps its body in a coroutine. It accepts an optional `__done` callback as the last parameter:

```lua
local function fetchData(url, __done)
    local __co = coroutine.create(function()
        local response = coroutine.yield({httpGet, url, n = 2})
        return response
    end)
    __nebra_async_drive(__co, __done)
end
```

### Await Expression

`await expr` compiles to `coroutine.yield(...)`. The async driver resumes the coroutine when the result is ready.

### Runtime Driver

Nebra emits a `__nebra_async_drive` helper that:

1. Resumes the coroutine
2. If the yielded value is a table with a function, calls it with a callback
3. The callback resumes the coroutine with the result
4. When the coroutine finishes, calls `__done` with the final result

### Callback Adaptation

`await` automatically adapts callback-style APIs. If you `await` a function that takes a callback as its last parameter, Nebra injects the callback:

```nebra
-- If httpGet(url, callback) is callback-style:
local data = await httpGet(url)
-- Nebra injects the callback automatically
```
