---
author: Bradly Ovitt
pubDatetime: 2023-03-14T22:12:03Z
title: "Variance in Typescript"
postSlug: variance-typescript
featured: false
draft: false
tags:
  - blog
  - typescript
description:
  An overview of covariance, contravariance, and invariance in Typescript.
---

Variance is kind of a niche topic in type systems but proper utilization gives us another degree of control over the correctness of our code. In this post I'm going to cover all types of variance, including bivariance.

As of Typescript 4.7.0 we can manually add variance markers to our generic types to ensure they are properly used. We'll go over this as well.

## Covariance:

Covariance, we often use for producers of some type. As of typescript 4.7.0, we can generalize a covariant producer like this:
```typescript
type Producer<out T> = () => T;
```
The `out` keyword tells us that `T` is covariant.

What does it mean to be covariant? 

Essentially, if `Musician` if a subtype of `Entertainer` then `Producer<Musician>` is a subtype of `Producer<Entertainer>`. 

We can test this:
```typescript
type IsSubtypeOf<S, P> = S extends P ? true : false;

type Producer<out T> = () => T;

class Entertainer {
    name: string;

    constructor(name: string) {
        this.name = name
    }
}

class Musician extends Entertainer {
    age: number;

    constructor(name: string, age: number) {
        super(name);
        this.age = age
    }
}

type X = IsSubtypeOf<Producer<Musician>, Producer<Entertainer>> // X is true
type Y = IsSubtypeOf<Producer<Entertainer>, Producer<Musician>> // Y is false
```

## Contravariance:

Contravariance, we often use for producers of some type. As of typescript 4.7.0, we can generalize a contravariance consumer like this:
```typescript
type Consumer<in T> = (x: T) => void;
```
The `in` keyword tells us that `T` is contravariant.

What does it mean to be contravariant? 

The following typing rules apply:

`SmallFish` < `Fish` < `Meat`
`Consumer<Meat>` < `Consumer<Fish>` < `Consumer<SmallFish>`

Where `x < y` means x is a subtype of y.

What we're saying here is that if you're looking for something to consume any `Meat` You can only give it to `Consumer<Meat>`. If you want something to consume any `Fish`, you can only give it to `Consumer<Fish>` or `Consumer<Meat>`. Also, if you want something to consume any `SmallFish`, we can only pass it to `Consumer<Meat>`, `Consumer<Fish>`, and `Consumer<SmallFish>`.

We can test this:
```typescript
type IsSubtypeOf<S, P> = S extends P ? true : false;

type Consumer<in T> = (x: T) => void;

class Meat {
    weight: number;

    constructor(weight: number) {
        this.weight = weight
    }
}

class Fish extends Meat {
    fishType: string;

    constructor(weight: number, fishType: string) {
        super(weight);
        this.fishType = fishType
    }
}

type X = IsSubtypeOf<Consumer<Meat>, Consumer<Fish>> // X is true
type Y = IsSubtypeOf<Consumer<Fish>, Consumer<Meat>> // Y is false
```

## Invariance:

By default all, all generic type must have some variance. The default is invariance. I won't go into depth because it's just default generic functionality you're probably used to. You can mark a generic type invariant by writing `in out` before it.

Whoot Whoot!

Done.