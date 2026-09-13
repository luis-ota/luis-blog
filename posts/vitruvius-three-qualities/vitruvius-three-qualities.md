---
title: firmitas, utilitas, venustas - the three qualities, 2000 years later
date: 2025-10-08
description: Vitruvius wrote down what a building needs. software keeps rediscovering the same three things.
img: /images/vitruvius-three-qualities/cover.jpg
---

firmitas, utilitas, venustas

![Roman Statue, marble sculpture. Location](inline.jpg)

three movements on a sentence older than software.

---

## i. it must hold

vitruvius wrote, around 25 bc, that a building must be durable. not beautiful first, not useful first. durable. the foundation is the least visible and the least negotiable part of the work.

the roman trick was pozzolana, a volcanic ash that let harbor concrete cure under water and last for two thousand years. nobody at the time could have known about the chemistry. they knew the material held, and they built with it.

software has its own pozzolana: idempotent operations, backups that get restored, migrations that have been run against real data, health checks that fail loudly. none of it is visible in a demo. all of it decides whether the thing still exists next year.

the question is never "does it work". it is "does it still work when something it depends on has already failed".

## ii. it must be used

the second quality is utility, and it does not live in a feature list. a doorway is useful if a person carrying something can pass through it. a stair is useful if a tired person can climb it without thinking about the stair.

this is where i spend most of my design time now: not on what the system can do, but on what the person is actually doing when they meet it. in what order, under what pressure, with what in their other hand.

features are countable. utility is not, which is why it gets skipped. the test is concrete: watch someone use it, and count the moments they hesitate.

## iii. it must be worth looking at

beauty was not decoration to the ancients. proportion was a claim about correctness. a building whose columns are misaligned usually has a structural error somewhere; the eye finds it before the instruments do.

the same is true of an interface. a row that is two pixels off, a heading that is a weight too heavy, a spacing rhythm that breaks in one place: each is small, and together they are the difference between a page that feels inevitable and one that feels assembled.

venustas is the visible residue of rigor. it cannot be added at the end, because it is the accumulated evidence of a hundred consistent decisions.

---

the three are independent, and that is the whole point. a durable ugly system is a failure of taste. a beautiful fragile one is a failure of engineering. a useful boring one is fine, and rare, and underrated.

two thousand years later, the checklist still closes the meeting.

## image credits

- cover: [Ancient Columns](https://www.flickr.com/photos/28490141@N03/8550047350) by rabiem22 (by 2.0)
- image: [Roman Statue, marble sculpture. Location](https://www.rawpixel.com/image/6111424/photo-image-face-public-domain-marble) by desconhecido (cc0 1.0)
