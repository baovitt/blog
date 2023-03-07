---
author: Bradly Ovitt
pubDatetime: 2023-03-06T19:19:17Z
title: "To Publish an Academic Paper with no Degree: The Idea"
postSlug: getting-published-part1
featured: false
draft: true
tags:
  - research
  - series
description:
    My journey to becoming a published researcher with no academic qualifications.
---

Here's the thing: I never finished high school. It's no secret this poses some problems for me in getting research published in a serious journal. Nonetheless, I'm gonna throw everything I have at it. Or, as my teachers used to say after I failed a test: I just need to apply myself.

But, before I do anything, I need an idea.

## The Idea:

I've find myself writing a compiler for a programming language I designed, and having never built any compilers before, I trying to be very careful not to shoot myself in the foot, fully exploiting my skills in other areas.

The part that scares me the most is the optimizer. I can write a parser with ANTLR4 and I can implement a static analyzer and type checker fairly easily as well. And, for my own sake, I want to implement a micropass optimizer. But, I also want it to be fast.

I can utilize recursion schemes to write disparate components of a type checker and optimizer and assemble them into a single compiler pass.

I want my paper to discuss this, while exposing a novel architecture for optimization application, while I'll next.

## E-Graphs

An equality is a data structure that allows us to represent equivalency transformations over some language. In essence it's a data structure that enables equality saturation over some language.

For a better explanation of equality graphs than I could ever give first hand, check out egg: https://egraphs-good.github.io/

Equality graphs enables us to create a rich graph structure encoding a list of transformations over a single program.

Our equality graph would consists of:
- A set `P` of all programs, as a type
- A set `O` of all optimizations
- A function `O -> R` that maps an optimization to its source program.
- A function `O -> R` that maps an optimization to its target program.
- A function `R -> O` that maps each program to its reflexive optimization

Equality Graphs graphs also typically contain sets of grouped nodes, where equivalent operators are in the same set, connected to values that make them equivalent.

## Equality Graphs as Reflexive Graphs

Let's think about equality graphs and what we're demanding of them.

## Representing E-Graphs as Change Structures

A change structure is another data structure, but it's more idiomatic to functional programming, something I advocate for strongly.

### Relational Parametricity:

A logical relation between two instances of the same type can be defined by looking at the logical structure of the two instances, which we can understand as the logical constructions we used to obtain the instance.

We can relate logical structures to capture change-of-representation in some type.