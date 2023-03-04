---
author: Bradly Ovitt
pubDatetime: 2023-03-04T01:09:17Z
title: "Writing the perfect resourceful map method (with experimental Scala)"
postSlug: the-perfect-effectful-map
featured: true
draft: false
tags:
  - scala
  - experiment
description:
  The process of implementing the perfect resourceful map method in Scala 3.1+
---

I want to drag you through the pits with me, because this is not how we're supposed to do things, yet...

There aren't official* ways to do this the right way, so we're going to use some features we're not supposed to use yet.

## The Task:
We want to generalize this kind of program:
```scala
val file: InputStream = _
try
  // read from stream
finally
  file.close
```
We're going to write a method that takes in a resource (like `InputStream`), performs an operations on it (higher-order method), then closes the resources and returns our operation on it.

## The First Problem:

Our naive implementation:
```scala
def mapResourceAutoclose[T <: java.io.Closeable, V](
  resource: => T,
)( f: T => V): Either[Throwable, V]  =
  try
    Right(f(resource))
  catch
    case e: Exception => Left(e)
  finally
    resource.close

```
Suffice to say, has some problems. For one, we don't want to catch ALL exceptions. An `InterruptedException` or `OutOfMemoryError` should be propagated to the caller, as that information might be important for the caller to properly handle an error. Luckily Scala has a solution in the standard library: `NonFatal`.

```scala
import scala.util.control.NonFatal

def mapResourceAutoclose[T <: java.io.Closeable, V](
  resource: => T,
)( f: T => V): Either[Throwable, V]  =
  try
    Right(f(resource))
  catch
    case NonFatal(e) => Left(e)
  finally
    resource.close
```

## The Second Problem:

There's another issue: calling the close method can return an error. This can happen whenever an internal buffer fails to flush bytes on the computers disk or an internal error happens when we call the close method. We can solve the former issue by suppressing an exceptions, like this:

```scala
import scala.util.control.NonFatal

def mapResourceAutoclose[T <: java.io.Closeable, V](
	resource: => T,
)( f: T => V): Either[Throwable, V]  =
	var exception: Option[Throwable] = None

	try
		Right(f(resource))
	catch
		case NonFatal(e) => Left(e)
	finally
		exception match
			case Some(e) => 
				try
					resource.close()
				catch
					case NonFatal(suppressed) =>
						e.nn.addSuppressed(suppressed)
			case None => resource.close()
```

## The Third Problem:

If we're implementing a try-with-resources type of pattern, we should really be using `AutoClosable` instead of just `Closable`. Closable only still exists for compatibility reasons:

```scala
import scala.util.control.NonFatal

def mapResourceAutoclose[T <: AutoCloseable, V](
	resource: => T,
)( f: T => V): Either[Throwable, V]  =
	var exception: Option[Throwable] = None

	try
		Right(f(resource))
	catch
		case NonFatal(e) => Left(e)
	finally
		exception match
			case Some(e) => 
				try
					resource.close()
				catch
					case NonFatal(suppressed) =>
						e.nn.addSuppressed(suppressed)
			case None => resource.close()
```

## The Fourth Problem:

Okay, cool. We have something close, no pun intended. But, what if we call our method like this:
```scala
val later = mapResourceAutoclose(file)(file => () => file.write(0))
(later.right.get)() // Gah, Crash!
```
Is there a way to fix this? Well, yes. But we need to get a little experimental...

It's time to import `language.experimental.captureChecking`. Capture Checking is a means to track effects, but also a means to track scope. Now we can write:
```scala
import scala.util.control.NonFatal

import language.experimental.captureChecking

def mapResourceAutoclose[T <: AutoCloseable, V](
	resource: => T,
)( f: ({*} T) => V): Either[Throwable, {resource} V]  =
	var exception: Option[Throwable] = None

	try
		Right(f(resource))
	catch
		case NonFatal(e) => 
			exception = Some(e)
			Left(e)
	finally
		exception match
			case Some(e) => 
				try
					resource.close()
				catch
					case NonFatal(suppressed) =>
						e.nn.addSuppressed(suppressed)
			case None => resource.close()
```

In essence, we're saying that the result depends on resource and the input to f must not be allowed outside the method as a closure.

## The Fifth Problem:

We're almost done, I promise. But, we need one more import: `scala.language.experimental.erasedDefinitions`. Essentially what we want to do is make it clear that our function might throw something and errors need to be handled.

```scala
import scala.util.control.NonFatal

import language.experimental.captureChecking
import scala.language.experimental.erasedDefinitions

erased class CanThrow[-E <: Throwable]
type ThrowsThrowable[R] = CanThrow[Throwable] ?=> R

def mapResourceAutoclose[T <: AutoCloseable, V](
	resource: => T,
)( f: ThrowsThrowable[({*} T) => V]): ThrowsThrowable[{resource} V]  =
	var exception: Option[Throwable] = None

	try
		f(resource)
	catch
		case NonFatal(e) => 
			exception = Some(e)
			throw e
	finally
		exception match
			case Some(e) => 
				try
					resource.close()
				catch
					case NonFatal(suppressed) =>
						e.nn.addSuppressed(suppressed)
			case None => resource.close()
```

Alright, now it's clear that we might throw an exception or error from our method. Note, I'm use `Throwable` here and not `Exception` because it's sometimes important to catch on any `Throwable` for logging purposes.

## Conclusion:

There, we are. Our perfect* implementation. It doesn't allow you to stream from an `AutoClosable`, but I think that functionality would best be implemented as a separate function. 

So, what does it look like? This beauty:

```scala
import scala.util.control.NonFatal
import scala.annotation.experimental

@experimental
object IO:
	import language.experimental.captureChecking
	import scala.language.experimental.erasedDefinitions

	erased class CanThrow[-E <: Throwable]
	type ThrowsThrowable[R] = CanThrow[Throwable] ?=> R

	def mapResourceAutoclose[T <: AutoCloseable, V](
		resource: => T,
	)( f: ThrowsThrowable[({*} T) => V]): ThrowsThrowable[{resource} V]  =
		var exception: Option[Throwable] = None

		try
			f(resource)
		catch
			case NonFatal(e) => 
				exception = Some(e)
				throw e
		finally
			exception match
				case Some(e) => 
					try
						resource.close()
					catch
						case NonFatal(suppressed) =>
							e.nn.addSuppressed(suppressed)
				case None => resource.close()
end IO
```

Hell yeah. 232 lines of markdown later, you got yourself a blog post.