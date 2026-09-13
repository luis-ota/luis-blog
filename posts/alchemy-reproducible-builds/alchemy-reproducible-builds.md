---
title: alchemy, secrecy and reproducible builds
date: 2026-06-02
description: alchemists wrote in symbols and lost their recipes. chemistry won by publishing methods. CI has been fighting this war for a decade.
img: /images/alchemy-reproducible-builds/cover.jpg
---

lab notebook: reproducibility, from alchemy to ci

![German Pharmaceutical Museum at Heidelberg Castle](inline.jpg)

excerpts from a notebook that spans four centuries. margins are mine, added later.

---

**entry, 1618.** the recipe for the philosopher's stone, as recorded by a student: "dissolve the red dragon in the green lion, then let the black crow fly." the teacher guards the meaning. the student writes symbols, not steps.

*margin:* a method that only one person can decode is not a method. it is a secret, and it will die with its owner.

---

**entry, 1660s.** a famous laboratory burns. years of process knowledge vanish with the notebooks. the apparatus survives; the *sequence* does not. competitors cannot verify anything, allies cannot help, and the failure is not reproducible either.

*margin:* data without a method cannot be debugged. this is the "works on my machine" of the seventeenth century.

---

**entry, 1789.** lavoisier publishes an elementary treatise of chemistry: named substances, a standard notation, described procedures. "nothing is lost, nothing is created, everything is transformed."

*margin:* the notable part is not a discovery. it is a *format*. with named ingredients and a shared notation, another laboratory can reproduce the result and find the error when it fails. the field accelerates because failure is now informative.

---

**entry, today. build.** `lockfile` pins the exact versions of every ingredient. the container records the apparatus: os, libraries, tools. ci is a foreign laboratory that runs the same recipe from scratch and complains if it gets a different result. checksums bind an artifact to an input.

*margin:* we chose the chemistry bet. publish the method, pin the environment, make the build repeatable. what stays private is credentials and customer data, not the *how*.

---

**entry, also today. the alchemist's objection.** "our setup is too messy to document." that was also true in 1660, and the answer has not changed: start with one recipe. a dockerfile. a make target. a readme that a new machine could follow. the first reproducible experiment is the hardest and the rest get easier.

*margin:* a result without a method is an anecdote. lockfiles, containers and ci are the modern standard notation, and they exist because someone lost a laboratory and decided never again.

---

*the philosophers' stone was never real. the method was, and it changed everything anyway.*

## image credits

- cover: [alchemist his laboratory his family:](https://www.rawpixel.com/image/14000037/image-cartoon-person-art) by desconhecido (cc0 1.0)
- image: [German Pharmaceutical Museum at Heidelberg Castle](https://www.flickr.com/photos/58415659@N00/14824010857) by kitmasterbloke (by 2.0)
