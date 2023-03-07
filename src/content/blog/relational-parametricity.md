---
author: Bradly Ovitt
pubDatetime: 2023-03-06T22:08:30Z
title: "Thinking about Relational Parametricity"
postSlug: relational-parametricity
featured: false
draft: false
tags:
  - blog
description:
  A brief of, and how to think of, relational parametricity.
---

When we explain something like relational parametricity, we usually talk about it as parametric polymorphism, but there's another way to think about it.

We can think of a type as a list of values with transformations to other types. We can think of a polymorphic type bounds like typeclasses, where a type have an instance of that typeclass.

We can then think of a programming language as a graph representing all possible programs. Each node being a type and each edge representing a function. Then we can view parametric polymorphism as the categorization of types based on edge patterns. 

For the record, other constructs are easy to interpret as well. For example, dependent types as a higher dimensional graph.

## Why from This Perspective?

For one, it's a neat way to compare different language concepts in terms how they affect our program space. Also:

- we can visualize polymorphic patterns
- we can describe every way to turn a type into another
- we can visualize how functions compose
- we can transform a programming language into an incremental change structure
- we can convert a graph to a programming language

In short, it's a powerful tool that allows us to inspect how we organize our codebase.