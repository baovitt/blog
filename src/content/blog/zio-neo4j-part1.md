---
author: Bradly Ovitt
pubDatetime: 2023-03-11T22:13:38Z
title: "Building ZIO-Neo4J: Part 1"
postSlug: zio-neo4j-part1
featured: false
draft: false
tags:
  - project
  - scala
description:
  Part 1 of implementing a ZIO interface to the Java Neo4J driver.
---

I'm writing a blog about Scala programming and I can continue to cover the core language as much as I want, but at some point it becomes more worthwhile for me to demonstrate Scala programming in action. In this series, the first of which, we'll be implementing a ZIO interface to the Java Neo4J driver.

At the end, we'll be publishing artifacts for Scala 3 and a documentation website.

## The Java Neo4J Driver:

Fortunately Neo4J provides us an official Neo4J driver we can use. We'll be implementing a connection class the end user can implement as a layer in their ZIO applications.

Of course, since it's a Java library it doesn't utilize and `Future` so we can immediately wrap any effects in a ZIO effect type.

## SBT Setup:

When implementing a library we need slightly a different SBT setup. Let's tackle it in digestible pieces.

### Plugins:

We're going to use three plugins so we'll have to change our `plugins.sbt` file:
```scala
addSbtPlugin("org.scalameta" % "sbt-scalafmt"   % "2.2.1")
addSbtPlugin("com.eed3si9n"  % "sbt-buildinfo"  % "0.11.0")
addSbtPlugin("com.geirsson"  % "sbt-ci-release" % "1.5.5")
```
Here we have `scalafmt` so we can automatically format our code every time we compile the project. We also have eed3si9n's `sbt-buildinfo` to automatically generate build information about our project. Finally, we have `sbt-ci-release` to automate Sonatype releases from GitHub Actions.

## Scalafmt:

We also need to create a `.scalafmt.conf` file for the plugin we just added. We're going to add the following to the file:
```
version=2.0.1
maxColumn = 120
align = most
continuationIndent.defnSite = 2
assumeStandardLibraryStripMargin = true
docstrings = JavaDoc
lineEndings = preserve
includeCurlyBraceInSelectChains = false
danglingParentheses = true
spaces {
  inImportCurlyBraces = true
}
optIn.annotationNewlines = true

rewrite.rules = [SortImports, RedundantBraces]
```

### SBT Build:

First we want to establish which versions of Scala we're using. I'll publishing for Scala 2.13 and Scala 3.1. We can now add the following to our `build.sbt` file:
```scala
lazy val mainScala = "3.1.2"
lazy val allScala  = Seq(mainScala, "2.13.8")
```
Next we want our `InThisBuild`:
```scala
inThisBuild(
  List(
    organization := "com.jobgun",
    homepage := Some(url("https://github.com/jobgun/zio-neo4j")),
    licenses := List("Apache-2.0" -> url("http://www.apache.org/licenses/LICENSE-2.0")),
    useCoursier := false,
    scalaVersion := mainScala,
    crossScalaVersions := allScala,
    Test / parallelExecution := false,
    Test / fork := true,
    run / fork := true,
    pgpPublicRing := file("/tmp/public.asc"),
    pgpSecretRing := file("/tmp/secret.asc"),
    pgpPassphrase := sys.env.get("PGP_PASSWORD").map(_.toArray),
    scmInfo := Some(
      ScmInfo(url("https://github.com/jobgun/zio-neo4j/"), "scm:git:git@github.com:jobgun/zio-neo4j.git")
    ),
    developers := List(
      Developer(
        "baovitt",
        "Bradly Ovitt",
        "oobrad76@gmail.com",
        url("https://github.com/baovitt")
      )
    )
  )
)
```
It's a lot to unpack but I think it's fairly self explanatory what's going on. Next we want some top-level definitions:
```scala
name := "zio-neo4j"
scalafmtOnCompile := true

enablePlugins(BuildInfoPlugin)
buildInfoKeys := Seq[BuildInfoKey](name, version, scalaVersion, sbtVersion, isSnapshot)
buildInfoPackage := "zio.neo4j"
```
Next we want to add our dependencies:
```scala
val zioVersion = "2.0.0"

libraryDependencies ++= Seq(
  "dev.zio"                %% "zio-test"                % zioVersion % "test",
  "dev.zio"                %% "zio-test-sbt"            % zioVersion % "test",
  "dev.zio"                %% "zio"                     % zioVersion,
  "org.neo4j.driver"       % "neo4j-java-driver"        % "5.6.0"
)
```
Finally, we have to add some options and aliases:
```scala
scalacOptions --= Seq("-Xlint:nullary-override")

testFrameworks += new TestFramework("zio.test.sbt.ZTestFramework")

addCommandAlias("fmt", "all scalafmtSbt scalafmt test:scalafmt")
addCommandAlias("check", "all scalafmtSbtCheck scalafmtCheck test:scalafmtCheck")
```

## Conclusion:

I just tested it and it compiles with a hello world.

Yeah!