---
sidebar_position: 4
title: "Control Flow"
description: "if, while, repeat, numeric and generic for, do blocks, break N, continue, goto and labels."
---

# Control Flow

## If / Elseif / Else

```nebra
if x > 0 then
    print("positive")
elseif x < 0 then
    print("negative")
else
    print("zero")
end
```

## While Loop

```nebra
while condition do
    -- body
end
```

## Repeat-Until Loop

```nebra
repeat
    -- body
until condition
```

## Numeric For

```nebra
for i = 1, 10 do
    print(i)
end

for i = 0, 100, 5 do  -- with step
    print(i)
end
```

## Generic For

```nebra
for k, v in pairs(tbl) do
    print(k, v)
end

for i, v in ipairs(arr) do
    print(i, v)
end
```

The compiler performs iteration type checking: when iterating over typed collections, loop variables are inferred. Enums are also iterable.

## Do Block

Creates a new scope:

```nebra
do
    local temp = compute()
    -- temp is only visible here
end
```

## Break

```nebra
while true do
    if done then break end
end
```

## Labels & Goto

```nebra
::retry::
local ok = tryOperation()
if not ok then
    goto retry
end
```

Available on Lua 5.2+ and LuaJIT targets.
