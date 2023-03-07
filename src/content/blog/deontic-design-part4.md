---
author: Bradly Ovitt
pubDatetime: 2023-03-04T19:19:17Z
title: "Designing a Programming Language Part 4: Strutting my Stuff"
postSlug: programming-language-design-part4
featured: false
draft: false
tags:
  - deontic
  - project
ogImage: "/public/assets/deontic.webp"
description:
  Part four in outlining the design of a programming language I'm working on called Deontic.
---

In this blog post we're going over some basic features of Deontic. We'll discuss:
- Comments
- Nondeterminism
- Unification
- Pattern Matching
- Layers
- Types
- Automatic Parallelism
- Packages

For starters, let's discuss comments. There are three types of comments:
```
//! Top level doc comments. These comment go at the top of a file. 
/// Doc comments. These comments documents functionality of constructs.
// Regular comments. These comments are for rudimentary usage, usually explaining things
```

Now if we want to create a program, we need to define its package, like this:
```
package com.baovitt.deontic.demo
```
Great, we did it!

Now, we want to write some functionality, but first we need to define a type. In Deontic, we can define a type like this:
```
type member [T] =>> T -> list T -> bool
```
This is a type representing a pure function. The keyword `type` tells us we're defining a new type called `member`. The next part `[T] =>>` tells us we're mapping a polymorphic type `T` to the signature `T -> list T -> bool`.

Now, we want to implement `member`. We can do so like this:
```
member _ [] = false
member Value [Head, Tail*] =
  if Value == Head then
    true
  else
    member Value Tail*
```
Essentially, we're pattern matching. If we list is empty, then it contains nothing, so it's false. If the list isn't empty, we want to return true if the head of list is equal to value and recursively call member, splicing to tail of the list until we've checked every element of the list. The '_' by the way, just means we don't care about the value. 

We can rewrite this in another way by using unification, like this:
```
member _ [] = false
member Head [Head, _*] = true
member Head [_, Tail*] = member Head Tail*
```
Now, we're saying that if the list is empty, we want to return true. If the head variable unifies, that is, can be made to equal the same thing, we want to return true. 

Our implementation serves two purposes: to compute results and to validate type instance. But, it's important to know which purpose we wish to utilize at any point. 

One thing to note is that our function has been given variables in it's definition for each parameter, whether that's explicit or not.

We could easily see our function as this: `member Val Ls`. This statement represents the total domain of our function. We'll expect to receive a non-strictly evaluated list of booleans, both true and false in this case. If we want to verify our type, all we have to do is provide the last parameter, a boolean

You could write `member 1 [1, 2, 3] true` and you'd get a valid instance of the member type. Or you could write `member X [1, 2, 3] true` and get a valid instance where X represents a nondeterministic variable bound to 1, 2, and 3.

## Layers:

Layers are a construct we can use to better organize our code and easily utilize inversion of control. Suppose we want to write a function that needs an file connection as an input and closes it.

Let's define the layer:
```
layer file string -> file_stream throws file_not_found_exception, ...

type read_from_file (layer file -> {_ -> type} T) -> T 
  throws file_not_found_exception, ...
```

We're defining a layer which can be thought of as a function that, given some input, returns an effectful value. In this case, also potentially throwing an exception.

## Automatic Parallelism:
Now, for the flagship feature: automatic parallelism. Let's take a look at this implementation:
```
type member [T] =>> T -> list T -> bool

member _ [] = false
member Head [Head, _*] = true
member Head [_, Tail*] = member Head Tail*
```
How can this function be made parallel? It's easy to tell here that we can make it parallel simply by checking each element of the list in parallel. I'm more concerned with how we can write rules that will take any function (or almost all) and make it parallel.

There are two types of parallelism we can utilize: and-parallelism and or-parallelism. Or-parallelism is easy. For each case in the function (pattern matching), we check each case in parallel. And-parallelism is more complicated. We need to think about binding propagation.

Essentially, if we have a binding used by two processes, we can run those two processes in parallel.