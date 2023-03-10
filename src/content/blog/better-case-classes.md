---
author: Bradly Ovitt
pubDatetime: 2023-03-10T22:03:21Z
title: "Better Case Classes in Scala"
postSlug: better-case-classes
featured: true
draft: false
tags:
  - blog
  - scala
description:
  How I choose to write my classes when working on important code.
---

Classes in Scala already come with a lot of functionality, but for FP purposes and writing idiomatic Scala, they're lacking. To make Scala classes more powerful, Scala has adopted a modifier to classes called `case` to automatically derive functionality. The problem is that a lot of the functionality provided helps you shoot yourself in the foot.

For our example of how to write idiomatic classes, we're going to implement a ipv4 address class. IPv4 addresses are split into four components separated by dotted decimal notation (four octets). The first three octets represent the network address, the third being the subnet. Finally, the fourth octet is the host address.

## Naive Implementation:

```scala
class IPv4Address(classA: Int, classB: Int, subnet: Int, host: Int)
```
Alright, we have our four named octets. Now, we have a problem. We can pass invalid numbers for each octet. The subnet could be -1. We could use bytes, but I'll refrain from it because bytes of the JVM are signed, meaning we can still get negative numbers. We're going to have to define our own constructor. We can write a constructor in a companion object:

```scala
class IPv4Address(classA: Int, classB: Int, subnet: Int, host: Int)

object IPv4Address:
	def apply(classA: Int, classB: Int, subnet: Int, host: Int): IPv4Address = 
		new IPv4Address(classA, classB, subnet, host)
end IPv4Address
```
Now, we can check if the parameters are valid, returning an `Option[IPv4Address]` instead:
```scala
class IPv4Address(classA: Int, classB: Int, subnet: Int, host: Int)

object IPv4Address:
  private inline def validOctet(octet: Int): Boolean =
    octet <= 255 && octet >= 0

  def apply(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Option[IPv4Address] =
    if validOctet(classA) && validOctet(classB) && validOctet(
        subnet
      ) && validOctet(host)
    then Some(new IPv4Address(classA, classB, subnet, host))
    else None
end IPv4Address
```

It's starting to get ugly, but we'll get back to that later. Now, we can only create valid IPv4Address instances, right? If we write `IPv4Address(1, 2, 3, 4)`, we get an `Option[IPv4Address]`. But, if we write `new IPv4Address(1, 2, 3, 4)`, we can an `IPv4Address`. The problem is that our constructor in class definition isn't private. We can change it like this:
```scala
class IPv4Address private (classA: Int, classB: Int, subnet: Int, host: Int)
```
Now, our constructor only works in the IPv4Address scope because it's private. We also want to make our class final so we don't have to worry about someone extending it and circumventing our validation:
```scala
final case class IPv4Address private (classA: Int, classB: Int, subnet: Int, host: Int)
```

## Making a Better API:

That's all nice, but we should probably make a better api in our companion object:
```scala
object IPv4Address:
  private inline def validOctet(octet: Int): Boolean =
    octet <= 255 && octet >= 0

  private def apply(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Option[IPv4Address] =
    if validOctet(classA) && validOctet(classB) && validOctet(
        subnet
      ) && validOctet(host)
    then Some(new IPv4Address(classA, classB, subnet, host))
    else None

  private def fromOctets(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Option[IPv4Address] = apply(classA, classB, subnet, host)
end IPv4Address
```
Now, we can add as many constructors with helpful names. We need another detail though. We want to pretty print our class, like this:
```scala
final case class IPv4Address private  (classA: Int, classB: Int, subnet: Int, host: Int):
	override def toString(): String = s"$classA.$classB.$subnet.$host"
end IPv4Address
```

Ugh, we're never done are we? We have our constructor, but we also want to know what is wrong when we encounter an error. Let's enumerate our errors:
```scala
enum IPv4AddressError:
    case InvalidClassAOctet extends IPv4AddressError
    case InvalidClassBOctet extends IPv4AddressError
    case InvalidSubnetOctet extends IPv4AddressError
    case InvalidHostOctet extends IPv4AddressError
end IPv4AddressError
```
We could definitely add more cases, but I think this properly illustrates the solution to our problem. Now we can change our object to this:
```scala
object IPv4Address:
  private inline def validOctet(octet: Int): Boolean =
    octet <= 255 && octet >= 0

  enum IPv4AddressError:
    case InvalidClassAOctet extends IPv4AddressError
    case InvalidClassBOctet extends IPv4AddressError
    case InvalidSubnetOctet extends IPv4AddressError
    case InvalidHostOctet extends IPv4AddressError
  end IPv4AddressError

  private def apply(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Either[IPv4AddressError, IPv4Address] =
    for
      classA_ <- Either.cond(
        validOctet(classA),
        classA,
        IPv4AddressError.InvalidClassAOctet
      )
      classB_ <- Either.cond(
        validOctet(classB),
        classB,
        IPv4AddressError.InvalidClassBOctet
      )
      subnet_ <- Either.cond(
        validOctet(subnet),
        subnet,
        IPv4AddressError.InvalidSubnetOctet
      )
      host_ <- Either.cond(
        validOctet(host),
        host,
        IPv4AddressError.InvalidHostOctet
      )
    yield new IPv4Address(classA_, classB_, subnet_, host_)

  def fromOctets(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Either[IPv4AddressError, IPv4Address] = apply(classA, classB, subnet, host)
end IPv4Address
```
What's the problem this time? We might want to get every error. If classA and classB are both invalid, we're only told classA is invalid. It only returns the first failure. This is where we really need to consider if our class needs this functionality, as many don't. But, I think our class could benefit from this functionality.

There's a few ways to do this. In general, we start using libraries for this kind of error accumulation. Cats, for example has official ways to conduct error accumulation. Without a library, though, our best approach is generally to change the apply method to something like this:
```scala
private def apply(
    classA: Int,
    classB: Int,
    subnet: Int,
    host: Int
):  Either[List[IPv4AddressError], IPv4Address] = 
    val classAEither = Either.cond(
        validOctet(classA),
        classA,
        IPv4AddressError.InvalidClassAOctet
    )

    val classBEither = Either.cond(
        validOctet(classB),
        classB,
        IPv4AddressError.InvalidClassBOctet
    )

    val subnetEither = Either.cond(
        validOctet(subnet),
        subnet,
        IPv4AddressError.InvalidSubnetOctet
    )

    val hostEither = Either.cond(
        validOctet(host),
        host,
        IPv4AddressError.InvalidHostOctet
    )

    val errors = List(classAEither, classBEither, subnetEither, hostEither) collect {
        case Left(err) => err
    }

    if errors.isEmpty then 
        Right(new IPv4Address(classA, classB, subnet, host))
    else Left(errors)
```
Oh.. Well that's not pretty, and it's pretty slow too. But it's also exactly what we're looking for. To me, writing code like this does us a world of favors later when we're tasked with maintaining a complex application we've built.

## Copy Construction:

When we create case classes, the compiler will automatically create a `copy` function which allows us to take an instance and create a new one, copying part or all of the constructors parameters. We don't have to worry about copy construction in Scala 3 because when we make our constructor private, it will also make `copy` private.

At first glance this seems like an issue, but it's really not.

## The Whole Thing:

Wow, already the longest blog post I've ever written. There's one more thing we need to do: every developers worst nightmare: documentation. Let's add comments to our code. 

Now, for the 130 line class with comments (without getters):
```scala
/** A class representing a valid IPv4 address.
  *
  * @param classA
  *   class A IPv4 octet
  * @param classB
  *   class B IPv4 octet
  * @param subnet
  *   subnet IPv4 octet
  * @param host
  *   host IPv4 octet
  */
final case class IPv4Address private (
    classA: Int,
    classB: Int,
    subnet: Int,
    host: Int
):
  /** Converts the IPv4Address to a String.
    *
    * @return
    *   The IPv4 address in dotted decimal notation.
    */
  override def toString(): String = s"$classA.$classB.$subnet.$host"
end IPv4Address

/** IPv4Address companion object containing smart constructors and error cases.
  */
object IPv4Address:
  /** Validates an octet ensuring it's within the unsigned byte range.
    *
    * @param octet
    *   // octet as an integer
    * @return
    *   If the octet is valid or not.
    */
  private inline def validOctet(octet: Int): Boolean =
    octet <= 255 && octet >= 0

  /** An enum representing ever validation error case for the IPv4Address class
    */
  enum IPv4AddressError:
    /** An error case representing an invalid class A octet
      */
    case InvalidClassAOctet extends IPv4AddressError

    /** An error case representing an invalid class B octet
      */
    case InvalidClassBOctet extends IPv4AddressError

    /** An error case representing an invalid subnet octet
      */
    case InvalidSubnetOctet extends IPv4AddressError

    /** An error case representing an invalid host octet
      */
    case InvalidHostOctet extends IPv4AddressError
  end IPv4AddressError

  /** Constructor for IPv4Address taking in octets.
    *
    * @param classA
    *   class A IPv4 octet
    * @param classB
    *   class B IPv4 octet
    * @param subnet
    *   subnet IPv4 octet
    * @param host
    *   host IPv4 octet
    * @return
    *   either a list of errors or an IPv4Address.
    */
  private def apply(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Either[List[IPv4AddressError], IPv4Address] =
    val classAEither = Either.cond(
      validOctet(classA),
      classA,
      IPv4AddressError.InvalidClassAOctet
    )

    val classBEither = Either.cond(
      validOctet(classB),
      classB,
      IPv4AddressError.InvalidClassBOctet
    )

    val subnetEither = Either.cond(
      validOctet(subnet),
      subnet,
      IPv4AddressError.InvalidSubnetOctet
    )

    val hostEither = Either.cond(
      validOctet(host),
      host,
      IPv4AddressError.InvalidHostOctet
    )

    val errors =
      List(classAEither, classBEither, subnetEither, hostEither) collect {
        case Left(err) => err
      }

    if errors.isEmpty then Right(new IPv4Address(classA, classB, subnet, host))
    else Left(errors)

  /** Constructor for IPv4Address taking in octets.
    *
    * @param classA
    *   class A IPv4 octet
    * @param classB
    *   class B IPv4 octet
    * @param subnet
    *   subnet IPv4 octet
    * @param host
    *   host IPv4 octet
    * @return
    *   either a list of errors or an IPv4Address.
    */
  def fromOctets(
      classA: Int,
      classB: Int,
      subnet: Int,
      host: Int
  ): Either[List[IPv4AddressError], IPv4Address] =
    apply(classA, classB, subnet, host)
end IPv4Address
```
## Testing:

I'm dedicating this section as both a conclusion and to cover how one should properly test classes like these. For one, we want to perform tests for both valid and invalid cases.

Sometimes when it comes to validation, the validation on some parameters depends on other parameters. We want to make sure we're testing each parameter on it's own, and in relation to other parameters. Also, make sure the correct error cases are being returned.

