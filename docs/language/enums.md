---
sidebar_position: 8
title: "Enums"
description: "Named constants with auto-numbering or explicit string and number values."
---

# Enums

Enums define a set of named constants.

## Basic Enum

Values are auto-numbered starting from 0:

```nebra
enum Color
    Red
    Green
    Blue
end
```

Compiles to:

```lua
local Color = {Red = 0, Green = 1, Blue = 2}
```

## Explicit Values

```nebra
enum HttpStatus
    Ok = 200
    NotFound = 404
    ServerError = 500
end
```

## String Enums

```nebra
enum Direction
    Up = "up"
    Down = "down"
    Left = "left"
    Right = "right"
end
```

String enums compile to a bidirectional lookup table:

```lua
local Direction = {Up = "up", Down = "down", Left = "left", Right = "right"}
Direction["up"] = "Up"
Direction["down"] = "Down"
-- ...
```

## Usage

```nebra
local c = Color.Red
if c == Color.Green then
    print("Green!")
end
```

## Enums in Match

```nebra
match status
case HttpStatus.Ok then
    print("Success")
case HttpStatus.NotFound then
    print("Not found")
case _ then
    print("Other")
end
```

## Iteration

Enums are iterable:

```nebra
for name, value in pairs(Color) do
    print(name, value)
end
```

## Exported Enums

```nebra
export enum Severity
    Low
    Medium
    High
    Critical
end
```
