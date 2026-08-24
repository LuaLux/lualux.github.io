---
sidebar_position: 3
title: "Classes and Interfaces"
description: "Modelling behaviour with interfaces, abstract classes, inheritance, default methods and instanceof, and seeing what each one costs in the output."
---

# Classes and Interfaces

Lua gives you tables and metatables and leaves the object model to you. Lux gives you a concrete one
and compiles it down to exactly the tables and metatables you would have written.

## The program

```lux title="src/main.lux"
--- The shape every species in the zoo shares.
interface Animal
    name: string

    function sound(): string

    --- Default method: implementers inherit this unless they override it.
    function describe(): string
        return self.name .. " says " .. self:sound()
    end
end

--- Shared state and behaviour for anything kept as a pet.
abstract class Pet implements Animal
    name: string
    protected age: number

    constructor(name: string, age: number)
        self.name = name
        self.age = age
    end

    abstract function sound(): string

    function isNoisy(): boolean
        return #self:sound() > 4
    end
end

class Cat extends Pet
    constructor(name: string, age: number)
        super(name, age)
    end

    override function sound(): string
        return "meow"
    end
end

class Dog extends Pet
    constructor(name: string, age: number)
        super(name, age)
    end

    override function sound(): string
        return "woof woof"
    end
end

local critters: Animal[] = { new Cat("Whiskers", 3), new Dog("Rex", 5) }

for _, critter in ipairs(critters) do
    print(critter:describe())
end

local rex = new Dog("Rex", 5)
print("rex is noisy: " .. tostring(rex:isNoisy()))
print("rex is a Pet: " .. tostring(rex instanceof Pet))
```

```
Whiskers says meow
Rex says woof woof
rex is noisy: true
rex is a Pet: true
```

## Reading it piece by piece

### The interface is a contract, not a table

`interface Animal` never exists at run time. It says that anything claiming to be an `Animal` has a
`name: string` field and a `sound(): string` method. That is what lets

```lux
local critters: Animal[] = { new Cat("Whiskers", 3), new Dog("Rex", 5) }
```

type-check: `Cat` and `Dog` are unrelated classes, but both satisfy `Animal`, so they share an array.

### Default methods carry a body

`describe()` has an implementation inside the interface. Implementers get it for free, and the
compiler copies the body onto each class that does not override it. That is why `Pet` never defines
`describe` yet `Cat` and `Dog` both answer it.

### `abstract` means "subclasses must supply this"

`Pet` declares `abstract function sound(): string` with no body. A class that extends `Pet` without
providing `sound` is a compile error. `Pet` itself cannot be instantiated.

In the output, the abstract method becomes a guard that raises if anything ever reaches it:

```lua
function Pet:sound()
	error("Abstract method 'sound' must be implemented")
end
```

### `override` is required, not decorative

Leave it off and the compiler warns:

```
warning[E4012]: Method 'sound' shadows a method in parent class 'Pet'; use 'override' to indicate this is intentional
```

This catches the classic refactoring bug where a parent gains a method that a child was already
using for something unrelated.

### `protected` is compile-time only

`protected age: number` is readable from `Pet` and its subclasses and nowhere else. There is no
runtime enforcement, because there is nothing in the output to enforce it with. It is a rule the
compiler checks and then forgets.

## What the compiler emits

```lua title="out/main.lua"
local Pet = {}
Pet.__index = Pet
Pet.__name = "Pet"
function Pet.new(name, age)
	return setmetatable({
		name = name,
		age = age
	}, Pet)
end
function Pet:sound()
	error("Abstract method 'sound' must be implemented")
end
function Pet:isNoisy()
	return #self:sound() > 4
end
function Pet:describe()
	return self.name .. " says " .. self:sound()
end
local Cat = setmetatable({}, { __index = Pet })
Cat.__index = Cat
Cat.__name = "Cat"
function Cat.new(name, age)
	local self = Pet.new(name, age)
	setmetatable(self, Cat)
	return self
end
function Cat:sound()
	return "meow"
end
```

This is the standard Lua prototype pattern. `Cat`'s metatable points `__index` at `Pet`, so method
lookup walks the chain. `Cat.new` delegates to `Pet.new` and then re-parents the instance.

`Animal` appears nowhere. Interfaces are erased entirely.

`__name` is set so `instanceof` and reflection have something to work with. `instanceof` itself
compiles to a small helper that walks the metatable chain, emitted once per file that uses it.

## Constructors and inheritance

Write the constructor out explicitly in every subclass and forward with `super(...)`:

```lux
class Cat extends Pet
    constructor(name: string, age: number)
        super(name, age)
    end
end
```

A subclass that omits its constructor entirely does **not** inherit the parent's parameter list, so
be explicit. Constructor arity is also checked strictly at the `new` site: if the constructor takes
two parameters, `new Cat("Whiskers")` is an error even when the second parameter has a default.

## Next

- [Classes](../language/classes.md) is the full reference, including getters, setters, static
  members and operator overloading.
- [Interfaces](../language/interfaces.md) covers interface inheritance and default methods in depth.
- [Modules and packages](./modules-and-packages.md) splits this across files and packages.
