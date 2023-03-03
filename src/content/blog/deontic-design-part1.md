---
author: Bradly Ovitt
pubDatetime: 2023-02-09T18:25:24Z
title: "Designing a Programming Language Part 1: Compiler and Build Design"
postSlug: programming-language-design-part1
featured: false
draft: false
tags:
  - deontic
  - project
ogImage: "/public/assets/deontic.webp"
description:
  Part one in outlining the design of a programming language I'm working on called Deontic.
---

Perhaps, you might think a section like this should be written about later. But, the way we interact with a programming language is integral to its design goals, and something we should strive for is the development of a healthy ecosystem. So, in this post I want to focus on how we interact with the language.

## Building Tooling and Library Ecosystem

Deontic will be completely backward compatible, so all we need to worry about in terms of a library ecosystem is what the earliest version supported is.

## Package Manager

Deontic needs a native package manager and online package registry. Publishing and consuming packages needs to be really, really simple. Also, as a language targeting WASM, Deontic libraries need to be sandboxed so malicious packages are more restricted (this is a huge problem on Node). On the modern web, lots of dependencies are used for even simple applications. For main thread performance, third party libraries will be offset to separate worker threads by default.

## Build Tool
Things we need:

- Great project templates
- Data Based Build Tool: can be analyzed, optimized, turned into documentation, and easily - generated and consumed by other tools
- Doesn’t shy away from really complex builds.
- Helpful build errors
- Low memory consumption

## Integrated Development Environment (IDE)

We don’t want an IDE, we want a generic language server with IDE features so we can use it various in various text editors and enable online IDEs. Our language server should be highly extensible so the community can make it better. Moreover, it should be tightly coupled with the compiler

## Interactive REPL

For one, the REPL needs to be integrated into the compiler. It should work well in a console, while also having integration with Jupyter notebook.

## OK, what about Ecosystem?

We want libraries that make the development experience easier. Undoubtedly, Scala’s pimp-my-library methodology has led to a vibrant open-source community, but has led to a complex language with pitfalls. In Deontic, the standard library needs to be opinionated and better than that of any other language. It should be declarative, generic, and really fast. If we succeed, libraries with extend the standard library directly and not other libraries, leading to a less fractured ecosystem.

## Platform:

I’ve been clear from the start that Deontic will target WASM. It’s cross-platform, fast, hyped-up, and has great startup times for edge functions. We want a really good optimizer for Deontic. Luckily, Deontic is based in logic so we can more easily reason about its semantics.

## The Compiler:

The compiler raises an important question: when should the compiler be rewritten in Deontic. I think its likely that the earliest versions of Deontic will be interpreters that will be used to write a production-grade compiler in Deontic. But, I’ll let the early community decide.

PS: If you want to take a look at what I’m building, check out this repository: https://github.com/baovitt/Deontic