---
author: Bradly Ovitt
pubDatetime: 2023-03-04T22:09:49Z
title: "Hyperdimensional Hashing for Better Load Balancing"
postSlug: hyperdimensional-hashing
featured: false
draft: true
tags:
  - blog
description:
  A sufficient overview of how to implement hyperdimensional hashing for load balancing.
---

I tell my engineer peers that I have one foot in industry and one foot in academia. I'm of the impression that industry offers the money and research offers the science and rigor. Together, they create opportunity.

I was interested to see if there was a better alternative to consistency hashing for load balancing and I found rendezvous hashing, which seems to be mildly better, but still a little obsolescent. So, I decided to take a look at the state-of-the-art in hashing mechanisms for load balancing

## Our Goal:

Our goal is simple: a cutting-edge mechanism of mapping requests to available services.

The problem is that highly elastic systems we often need to redistribute requests which can cause a myriad of efficiency issues like memory locality.

## Hyperdimensional Computing:

Hyperdimensional computing is a computing model based on scientific observations of how brains work. The primary observation being that large circuits are important to the brains computational model.

Here's the real kicker: we're working with 10,000 bit words, not 32 bit words. It's sounds complicated, but all it means is computing with really long vectors. Why would we do that?

- We can sum two vectors to get a similar vector.
- We can find the product of two vectors to get a dissimilar vector.
- Our data is distributed among many points so there's a lot of data redundancy.
- You can compute the similarity between hypervectors by computing the cosine similarity or hamming distance.

## Hyperdimensional Hashing:

Hyperdimensional hashing encodes each server and request with the same hash function. 

Suppose we have a have function and an encoding function that takes in x, which is either a server or a request. 

## Creating a Circular Hypervectors:

Really long vectors is easy. But, how to we encode what we want with circular hypervectors?

The information we're looking to encode is servers and requests. Our function takes as an input a number of servers and requests. These circular hypervectors can be computed beforehand for lower latency.

For our function, we also need a random hypervector and a queue. 
```
computeCircularHypervector(n: Int, d: Int) = 
  queue = { empty queue }
  ranVector = { random hypervector }
```
Next we perform a forward transformation:
```
  for (i <- 2 to (n / 2)) do

```

## Operations on Hypervectors in Hyperspaces:



## Sounds Weird? Hyperdimensional Hashing?

Hyperdimensional hashing still forms a ring, just like consistency hashing, but the ring is a 10,000 bit hypervector.

We encode all servers and requests to the circular hypervector. Then each requests gets routed to the server whose hyperspace representation is closest to it. We'll discuss more of what that means later