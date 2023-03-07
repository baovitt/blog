---
author: Bradly Ovitt
pubDatetime: 2023-03-06
title: "Why JobGun chooses Scala"
postSlug: jobgun-scala
featured: false
draft: false
tags:
  - blog
description:
  A brief overview of why JobGun chooses to build backend services in Scala.
---

When we began to plan JobGun's implementation, we were eager to use tools we were familiar with. I, being a backend Scala developer, had experience building services with the Play Framework and PostgreSQL. Alex, being a frontend dev (stack agnostic as he put it), but mainly sticking to Ruby on Rails and Bootstrap. Suffice to say, we're not using any of those technologies, except for Scala of course.

Scala has its roots as a functional programming language in academia, yet it's found commercial success. Unlike academic languages like Haskell and Prolog, Scala embraced industry. In doing so, it runs on the JVM, is interoperable with Java libraries, and supports OOP. In fact, we use Java encryption libraries in our Scala code.

## Infrastructure:

Scala infrastructure is a little sad. The omnipresent built tool, SBT, is almost universally hated. IDE support is universally hated, only worsened by significant new syntax changes in Scala 3. Dependencies are published to Maven, an obsolescent archive without proper support for Scala's three targets: Scala.js, Scala on JVM, and Scala Native. Despite this, Scala does have a great REPL, and support for multiproject builds, something we utilize heavily for developing our microservice architecture.

## Ecosystem:

Scala has one of the best developer ecosystems of any language, which is amazing for a community of it's size. But, there is generally a division between OOP developers, usually coming from Java, and FP developers. Our codebase is written in the FP style, as I come from the FP world and am far more familiar with the paradigm.

In the FP Scala ecosystem, there's a number of open source ecosystems like ZIO, Cats, ToFu, etc. We can also find a large number of libraries that support integration with all major ecosystems as well as ecosystem specific libraries.

## Language:

Scala is a cross platform FP/OOP programming language, production ready for running on the JVM, and compiling to JS, allowing Scala to be used both on the frontend and backend.

It is notoriously difficult to find quality functional Scala programmers. Scala is considered a highly complex language, not fit for beginners, and as such, Scala developers are very expensive. It's not unusual for senior FP Scala developers to make ~$200,000 a year. But, that cost comes with it's benefits. 

Scala is highly fit for writing enterprise grade software. In fact, a lot of the technologies you likely use are written Scala. For example, Kafka, Flink, Spark, etc. And what's more, disregarding tooling, Scala can be written as fast, or faster than the equivalent functionally correct Python or JS code. Meanwhile, it provides type-safety, higher-performance, and greater scalability.

Scala allows us to follow architectural best practices while writing maintainable and correct code at any size.

## Our Scala Code:

For our purposes we chose ZIO, known for it's industry applicability, instead of a focus in academia. ZIO is intended to enable developers to easily write high performance concurrent and asynchronous functional programs, with its effect type ZIO.

The ZIO ecosystem enables us to write asynchronous microservices communicating with each other via gRPC. ZIO also comes with an official Kafka client, which we use to feed data into Redpanda.

We considered using Scala.js on the frontend, but ulimately decided to use Typescript instead, utilizing the Qwik framework.

## Conclusion:

Thus far, our application in Scala is clean, easy to test, decoupled, and in general to work with. Perhaps I'm evangelical, but Scala helps us build functionality while leaving us confident unexpected behavior is minimized.

Go for Scala.