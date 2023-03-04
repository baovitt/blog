---
author: Bradly Ovitt
pubDatetime: 2023-03-03T19:20:17Z
title: "Designing a Programming Language Part 3: Scope Tracking"
postSlug: programming-language-design-part3
featured: false
draft: false
tags:
  - deontic
  - project
ogImage: "/public/assets/deontic.webp"
description:
  Part three in outlining the design of a programming language I'm working on called Deontic.
---

We want to design an effect system. And, to do that, we need a clear understanding of what we mean and what we're truly hoping to achieve.

When I say effect, I don't mean the effect. I mean our data about the effect.

If you've read part two, you know our effect consists of three types: the environment, errors, and results. Additionally, we have a runtime responsible for executing the effect and an implementation of the effect.

This also enables us to perform precise effect tracking, with the environment representing dependencies necessary to run the effect. But what about scope tracking?

## The Problem:

For practicality purposes, I'll demonstrate in Scala:

```scala
def usingLogFile[T](op: FileOutputStream => T): T =
  val logFile = FileOutputStream("log")
  val result = op(logFile)
  logFile.close()
  result
```

When using this in the obvious way, we don't have an issue. We can call this function with the expected behavior as long as T represents single-order value. But, if we try something like this:
```scala
val later = usingLogFile { file => () => file.write(0) }
```
We find that calling `later()` results in an error because the `FileOutputStream` has already been closed. The problem is that `FileOutputStream` can escape the `usingLogFile` closure. The tool enabling us to find this unexpected behaviour? Parametric Polymorphism.

## The Solution:

We can solve this issue using what's known as capture tracking in the Scala ecosystem, similar to concepts like lifetimes in other languages like Rust. Essentially, we can mark the kind of the polymorphic type.

Like this, in deontic:
```
type usingLogFile (FileOutputStream -> T) -> {_ -> type} T end
```
Here, we're stating that the return kind of T must be an atomic type.