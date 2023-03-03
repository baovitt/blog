---
author: Bradly Ovitt
pubDatetime: 2023-02-19T15:47:24Z
title: "The Quest for the Perfect Fizzbuzz Solution"
postSlug: perfect-fizzbuzz
featured: false
draft: false
tags:
  - scala
description:
  My progression in designing a fizzbuzz solution using Scala and ZIO
---

Yesterday, I found myself solving leetcode problems out of curiosity. I found that they are essentially the worst mechanism for testing a programmers ability. Yet, they are so common at big tech companies. I decided I wanted to implement fizzbuzz in a way that actually demonstrates a programmers ability. Here we go.

## How Many Ways can Fizzbuzz be Solved?

There is the naive implementation:

```scala
(1 to 100).map { (i: Int) =>
  i match {
    case n if n % 15 == 0 => "fizzbuzz"
    case n if n % 3 == 0 => "fizz"
    case n if n % 5 == 0 => "buzz"
    case n => n.toString
  }
}.foreach(println(_))
```


This is almost always what you see. It’s the easiest way to understand the problem. There are other forms of solutions, but they all come with downsides, either in complexity or degradated performance.

### What we like:

- Immutable data
- Easy to read (could be better)

### What we don’t like:

- Print is called more than once
- It’s not parallel
- Print can overflow (no error handling)
- Only generates 1 to 100

Let’s fix these, one at a time.

## Infinite Stream Implementation:

```scala
val stream = Stream.from(1)

inline def transform(num: Int): String = 
  num match
    case n if n % 15 == 0 => "fizzbuzz"
    case n if n % 3 == 0 => "fizz"
    case n if n % 5 == 0 => "buzz"
    case n => n.toString

stream.map(transform(_)).take(100).toList.foreach(println(_))
```

Now we have an infinite stream that evaluates lazily. We can tell it take more than 100 numbers if we so please. Also, we’ve separated the transform method from the stream, improving readability.

### What we don’t like:

- Print is called more than once
- It’s not parallel
- Print can overflow (no error handling)

## MkString Implementation:

```scala
val stream = Stream.from(1)

inline def transform(num: Int): String = 
  num match
    case n if n % 15 == 0 => "fizzbuzz"
    case n if n % 3 == 0 => "fizz"
    case n if n % 5 == 0 => "buzz"
    case n => n.toString

println(stream.map(transform(_)).take(100).toList.mkString("\n"))
```

Cool! Now, we have the same thing has before but we’re using mkString so we only have to call print once. In theory, this improves throughput by saving the OS some work.

### What we don’t like:
- It’s not parallel
- Print can overflow (no error handling)

## ZIO Parallel Implementation

```scala
import zio.{ZIO, UIO, ZIOAppDefault, Console, ExitCode}, zio.stream.ZStream

object UltimateFizzbuzz extends ZIOAppDefault:
  def run = logic

  inline def logic: ZIO[Any, java.io.IOException, Unit] = stream
    .mapZIOPar(20)(transform(_))
    .mkString("", "\n", "")
    .flatMap(Console.printLine(_))

  inline def stream = ZStream.iterate(1)(_ + 1) take 100

  inline def transform(num: Int): UIO[String] = ZIO.succeed {
    num match
      case n if n % 15 == 0 => "fizzbuzz"
      case n if n % 3 == 0 => "fizz"
      case n if n % 5 == 0 => "buzz"
      case n => s"$n"
  }
end UltimateFizzbuzz
```

Now we’re using mapZIOPar to run the map operation concurrently. As before, we’re only calling print once, and we can easily make is compute more than 100 numbers. Notice that logic type. It contains an exception. Printing to the console can return an IO exception. ZIO also handles this error. The app will return with either a success or failure exitcode depending on if we receive and IOException.