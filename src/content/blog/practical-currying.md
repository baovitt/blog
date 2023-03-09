---
author: Bradly Ovitt
pubDatetime: 2023-03-09T22:08:30Z
title: "Practical Currying with Scala"
postSlug: practical-currying
featured: false
draft: false
tags:
  - blog
  - scala
  - case-study
description:
  Some examples of practical currying Scala.
---

Currying is often a neglected feature and one without significant practical benefits, but occasionally grants us the right amount of flexibility in our code.

For those who don't know what currying is, the basic idea is functions that return functions. In Scala you can write it like this:
```scala
def curryingAdd(n: Int) = ((n2: Int) => n + n2)
```

But Scala also has shorthand syntax to make currying functions a lot easier. You might also recognize this syntax from using implicits or DI methodologies.

```scala
def curryingAdd2(n: Int)(n2: Int): Int = n + n2
```

Essentially, each parameter list can be provided sequentially at different calling sites. This has a few theoretical notes attached, namely the connection to the foundations of functional programming. But, in this post I want to focus on the practical applications of currying.

## Currying to Generalize Calling Sites

I was recently working with ZIO on microservice that needed to interact with Neo4J. I was using the offical Neo4J Java driver and a library to generate queries using a DSL.

At the beginning of the application a driver instance is generated that lives the lifetime of the application. But, for each request we want to create a session so we can run a managed request.

The Java driver has a function to send a request using a higher order function. It takes a function with a session parameter and returns a polymorphic type. I wanted to use the use, release, acquire functionality of ZIO so I could guarantee each session was closed after using it. 

The problem was that I wanted more than one type of query, so I needed to add a map type method taking a session and returning a polymorphic type in the use method. Unfortunately, ZIO will pass whatever I define in the use function as the parameter to the Neo4J driver. 

This problem can be solved with currying by defining a use function like this:
```scala
def use[T](f: Session => T)(session: Session): Task[T] =
    ZIO succeed f(session)
```

Notice when we call use, we can pass into the map functionality to generate whatever use function we want at call time, but when it's passed to `ZIO.acquireReleaseWith` it's of the signature `Session => Task[T]` where T was previously provided.

## Progressive Computation

Let's take a look at this example:
```scala
def add3(n1: Int)(n2: Int): (Int, Int => Int) =
	(n1 + n2, {n3 => n3 + n2 + n1})

add3(1)(2)._2(3) // 6
```

What we're doing is creating a function that allows us to get the sum of the first two and three numbers provided. The difference it we're computing the sum of the first two numbers as soon as they're provided. We don't need the third parameter, and we shouldn't. Of course, the obvious downside it we lose our nice syntactic sugar and it's not as pretty to call. 

But if we needed the sum of the first two number to find the parameter to the third number, our options are this, parameterizing the code to turn `n1 + n2` into the parameter `n3` like we did before, or calling an external function which may or may not change application state.

In general, this is considered a bad practice, but it goes to show what we can do with currying.

## Using in Scala

Here's another example of when we want to use currying for nicety purposes. Before Scala 3 we would implicits, but now we use given and using clauses.

A great of example of when we want to use givens is passing runtime information and instances to effectful or concurrent code. But, perhaps the most common application is the use of typeclasses. Let's define a monoid typeclass:
```scala
trait Monoid[T]:
    def combine(x: T, y: T): T
    val empty: T
end Monoid
```

We can define instances of Monoid like this:

```scala
given intMonoid: Monoid[Int] with
    def combine(x: Int, y: Int): Int = x + y
    val empty: Int = 0

given floatMonoid: Monoid[Float] with
    def combine(x: Float, y: Float): Float = x + y
    val empty: Float = 0.0
```

Now, we can use it with currying:
```scala
def combine[T : Monoid](x: T, y: T): T =
    summon[Monoid[T]].combine(x, y)
```

Wait, you say! That's not currying! Well, it is. The expression `[T : Monoid]` in the function is syntactic sugar. The function expands to:

```scala
def combine[T](x: T, y: T)(using Monoid[T]): T =
    summon[Monoid[T]].combine(x, y)
```

That using clause is automatically provided if a valid given is in scope. So now we can write `combine(1, 2)` and `combine(1.0, 2.0)` and receive valid results.

## Conclusion:

Currying, as a built in feature of Scala, allows us to create complex functional abstractions over our codebase. If it weren't for currying, typeclasses would look a lot different in Scala. If it weren't for currying, I would have to create some ad hoc solution to the problem I faced in the first example.

Just be careful. Overuse of currying can make your code slower and more difficult to reason about.

Please curry responsibly.