---
author: Bradly Ovitt
pubDatetime: 2023-02-18T19:18:24Z
title: "Designing a Programming Language Part 2: Runtime"
postSlug: programming-language-design-part2
featured: false
draft: false
tags:
  - deontic
  - project
ogImage: "/public/assets/deontic.webp"
description:
  Part two in outlining the design of a programming language I'm working on called Deontic.
---

Deontic heavily utilizes the concept of effects. Before we get into the nitty-gritty, I need to clarify something. When we’re programming with effects, the effect is not the effect. The effect is our data about the effect. In deontic an effect consists of five components: runtime, resources, errors, cause, and results.

 - A resource is what’s required to run the effect, like function parameters are required to run a function.
- Errors are the errors an effect might return if it fails to compute properly.
- Results are what is returned when the effect is computed successfully.

Our runtime contains a threadpool and provides effects with their requirements and then runs the effect. You can think of effects as components of a blueprint, where the runtime builds what we describe.

# More on Effects:

## Resources:

As previously mentioned, resources are the data necessary to run an effect, and our runtime might have it’s own resources, but those resources are contained within the runtime so they don’t need to be supplied. The resources of an effect are represented as an intersection, as in typescript (kind of).

## Errors:

Errors are represented as a union (sort of). This gives us an open set of possibilities which is not limited by any application level type hierarchy. Certain runtimes might mean certain errors aren’t capable of occurring.

## Result:

The result is quite simply, the result we’re trying to attain.

## What our Runtime Does:

- Handle unexpected errors
- Capture stack traces
- Ensure finalizers are run
- Spawn fibers
- Yield to other fibers

You can think of the runtime as the manager of our program, ensuring it runs correctly.

## Default Runtime:

The default runtime is a general purpose runtime of application-local code. It includes no resources, an empty set of fibers and the default set of runtime flags.

## Runtimes?

In a complex application, it’s often ideal there is more than one runtime. The application contains necessarily one runtime to run all effects where another isn’t specified. This is called the top-level runtime.

An application programmer may also find it necessary to include a local runtime for certain effects. Runtimes with certain enhanced or restricted capabilities may be included if necessary by the programmer.

## Libraries and Security:

In the previous post I proposed that libraries should run on separate workers thread so they don’t clog the main thread, and that they are run with restricted privileges for greater application security.

## Runtime Hierarchy:

When we use a local runtime, the runtime which is managed over it is the runtime manager. The top-level runtime is the only runtime with no manager. The manager runtime is also tasked with allocating resources for the runtimes it manages.

## Library Runtime:

Libraries should be shipped with the default library runtime unless it’s privileges prove insufficient for the libraries task. In that case, the application developer will be warned at compilation time what escalated privileges the library requires. In the application code, the user can modify the runtime the library utilizes.

There’s a brief overview of the runtime system in Deontic.

Let me know your thoughts.

Regards,

Bradly O. 




