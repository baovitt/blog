---
author: Bradly Ovitt
pubDatetime: 2023-01-29T22:47:24Z
title: "A Story of Rules (in Logtalk)"
postSlug: a-story-of-rules
featured: false
draft: false
tags:
  - logtalk
description:
  A brief overview of rules in the Logtalk programming language.
---

Let’s talk about Logtalk rules. Logtalk rules are a lot like logtalk facts, and facts are essentially a subset of rules. Let’s create a knowledge base:

```prolog
:- object(rules).
 :- public(parent/2). /* people(name, name) */

 parent("John", "Mack").
 parent("Lucy", "Mack").
 parent("Olive", "Lucy").
 parent("Lex", "Lucy").

:- end_object.
```

Great! We have a family structure spanning three generations. Remember when I called facts rules. How can we make those facts rules? Like this:

```prolog
:- object(rules).
 :- public(parent/2). /* people(name, name) */

 parent(X, Y) :- X = "John", Y = "Mack".
 parent(X, Y) :- X = "Lucy", Y = "Mack".
 parent(X, Y) :- X = "Olive", Y = "Lucy".
 parent(X, Y) :- X = "Lex", Y = "Lucy".

:- end_object.
```

Nice, but what does it mean? Both X and Y are wildcards. Each expression is saying that parent(X, Y) is true when X equals something and Y equals something. Now, if we try some queries, we get what we’d expect:

```prolog
1 ?- rules::parent("John", "Mack").        
true.

2 ?- rules::parent(X, "Mack").
X = "John" ;
X = "Lucy".
```

Why not just make facts? Let’s try something else:

```prolog
:- object(rules).
 :- public(parent/2). /* people(name, name) */

 parent(X, Y) :- (X = "Lucy"; X = "John"), Y = "Mack".
 parent(X, Y) :- (X = "Lex"; X = "Olive"), Y = "Lucy".

:- end_object.
```

We’re able to use a semicolon, representing to disjunction, to shorten the number of rules, exploiting similarities.

## Is that it?

Now, I have something really exciting to show you. We can exploit more complex unification by calling other predicates. Let’s define a grandparent rule:

```prolog
:- object(rules).
 :- public(parent/2). /* people(name, name) */

 parent(X, Y) :- (X = "Lucy"; X = "John"), Y = "Mack".
 parent(X, Y) :- (X = "Lex"; X = "Olive"), Y = "Lucy".

 :- public(grandparent/2). /* grandparent(name, name) */

 grandparent(X, Z) :- parent(Y, Z), parent(X, Y).
:- end_object.
```

Ok, we’ve done a few things. For one, we’ve created a grandparent predicate that defines the grandparent relation using the parent relation. Secondly, we’ve expanded the domain of grandparent to be dependent upon parent. It’s not just facts, it’s rules, or reasoning. Grandparent isn’t a set of data points, it’s a true definition operating on an external data source.

## Are we done yet?

No, there’s more! We can combine rules and facts. In doing so, we can call a predicate recursively. We need to move on to a new example, but before we can do that, we need to discuss lists. Lists in Logtalk are like this:

```prolog
[] /* Empty list */
[Head|Tail] /* List decomposition */
[1, 2, 3, 4] /* List construction */
```

Pretty simple, right? Now, let’s make a rule that tells us if an element is in a list:

```prolog
:- object(rules).
 :- public(member/2).
 
    member(Head, [Head| _]).
    member(Head, [_| Tail]) :-
        member(Head, Tail).
:- end_object.
```

Can you see how that works? If the element matches the head of the list, it’s true, if it doesn’t, it checks calls the predicate again with the tail of the list, until it’s either true or it checks every element. Let’s see if it works:

```prolog
2 ?- rules::member(1, [1, 2, 3, 4]).
true ;
false.

3 ?- rules::member(X, [1, 2, 3]).
X = 1 ;
X = 2 ;
X = 3 ;
false.

4 ?- rules::member(1, X).
X = [1|_] ;
X = [_, 1|_] ;
X = [_, _, 1|_] ;
X = [_, _, _, 1|_] ;
X = [_, _, _, _, 1|_] /* Goes on forever */

5 ?- rules::member(X, Y).
Y = [X|_] ;
Y = [_, X|_] ;
Y = [_, _, X|_] ;
Y = [_, _, _, X|_] ;
Y = [_, _, _, _, X|_] /* Goes on forever */
```

Woah! It works!

I hope you learned something. Go built something cool.

Regards,

Bradly O.