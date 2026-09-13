---
title: Roman roads were an API
date: 2026-02-03
description: standardized surfaces, documented milestones, published deprecation. the cursus publicus is infrastructure design and we keep re-learning it.
img: /images/roman-roads-api/cover.jpg
---

itinerary: walking the via appia with api design notes

![The East Gate, Ancient Edessa](inline.jpg)

a travel log in five milestones, read as infrastructure.

---

**milestone i. the specification**

the road begins as a rule, not a road. a width, a camber, a layered base, a crown so water leaves. every via in the empire follows the same recipe, which is why a traveler from rome can trust a road in gaul without inspecting it.

*api note:* the value of a standard is that the client does not need to know the server. conformity is boring on purpose.

---

**milestone ii. the layers**

under the surface: a bed of stones, gravel, sand, and a paved top. the top is what everyone photographs. the drainage is what keeps it alive.

*api note:* the parts nobody sees decide the uptime. connection pooling, migrations, retry policy, backpressure. an interface is only as good as its least visible layer.

---

**milestone iii. the milestone**

a stone every thousand paces, with the distance and the name of whoever built it. a traveler always knows where they are and who to blame.

*api note:* observability is not a dashboard you add later. it is the `GET /health` on the side of the road. version, owner, position.

---

**milestone iv. the maintenance contract**

the roads were maintained by law, by curators and contractors responsible for stretches. without that, the drainage silts, the slabs shift, and the road becomes a trail. the decay is silent for years and then total.

*api note:* abandoned endpoints do not disappear. they rot. deprecation policies, migration guides and sunset headers are the maintenance contract.

---

**milestone v. the destination**

all roads lead to rome. the phrase is usually read as imperial vanity. it is also a compatibility claim: the road itself knows nothing about where you are going. it promises the same trip, every time.

*api note:* a good interface is neutral about use. it guarantees the journey, not the destination.

---

arrival. the via appia survives as a ruin with grass in its joints. the specification did not survive; we reverse-engineered it from the stones.

infrastructure outlives the documents describing it, and both outlive the people who cared. write accordingly.

## image credits

- cover: [Via Appia ruins](https://www.flickr.com/photos/70591690@N00/688344822) by ZeroOne (by-sa 2.0)
- image: [The East Gate, Ancient Edessa](https://www.flickr.com/photos/41523983@N08/6974660670) by Following Hadrian (by-sa 2.0)
