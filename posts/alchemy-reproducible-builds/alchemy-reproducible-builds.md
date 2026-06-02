---
title: alchemy, secrecy and reproducible builds
date: 2026-06-02
description: alchemists wrote in symbols and lost their recipes. chemistry won by publishing methods. CI has been fighting this war for a decade.
img: /images/alchemy-reproducible-builds/cover.jpg
---

Alchemists were not stupid. They invented apparatus, discovered elements, and recorded real reactions. What they lacked was a **format for reproducibility**: much of their knowledge was written in deliberate riddles, in symbols only insiders could read, protecting secrets from competitors and from the church.

![German Pharmaceutical Museum at Heidelberg Castle](inline.jpg)

The recipe for a thing was tied to a person. When the person died, the knowledge often died with them.

Chemistry, as it formed in the 18th century, made a different bet: publish the method, standardize the notation, name the substances. Lavoisier's *Traité élémentaire de chimie* was, in a sense, a public specification. Anyone with the equipment could reproduce the result. The field accelerated because failure could now be *debugged*.

## "works on my machine" is an alchemical sentence

A build that only works on the author's machine is a riddle. The environment is part of the recipe, and if it isn't written down, nobody can reproduce the result.

Everything we call "reproducible builds" is the chemistry bet, applied to software:

- a **lockfile** pins the exact versions of the ingredients,
- a **container** records the apparatus: OS, libraries, tools,
- **CI** is a second lab that runs the same recipe from scratch, and complains if it gets a different result,
- **checksums and signatures** hook the output to a specific input, so you can prove the artifact came from that recipe.

When those exist, a failure is an experiment you can rerun. When they don't, every bug hunt starts with an argument about whose machine is "correct".

## secrecy is a real trade-off

There is a reason alchemists hid their work, and there are reasons we don't open-source everything. But the cost is the same as it was then: knowledge that only exists in one head is one accident away from being lost.

I've made the chemistry choice for everything I can: environments in files, decisions in the repo, deployments as code. What stays private is credentials and customer data, not the method. The method is what lets anyone, including future me, reproduce the outcome.

## what I took from this

- A result without a method is an anecdote.
- Environments are part of the recipe. Pin them or you're guessing.
- Standard notation is a technology. YAML, Dockerfiles and lockfiles are the modern version.
- If only one person can make it work, it isn't an engineering artifact yet.

The philosophers' stone was never real. The reproducible method was, and it changed the world anyway.

## image credits

- cover: [alchemist his laboratory his family:](https://www.rawpixel.com/image/14000037/image-cartoon-person-art) by desconhecido (cc0 1.0)
- image: [German Pharmaceutical Museum at Heidelberg Castle](https://www.flickr.com/photos/58415659@N00/14824010857) by kitmasterbloke (by 2.0)
