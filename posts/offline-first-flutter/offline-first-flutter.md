---
title: offline-first is a data modeling problem
date: 2026-06-16
description: a trucking app taught me that sync is not a library toggle. it's a set of decisions about identity, conflicts and retries.
img: /images/offline-first-flutter/cover.jpg
---

You can find the code at: [github.com/luis-ota/AppTransportadora](https://github.com/luis-ota/AppTransportadora).

Listen to `PASTEL GHOST - Shadows` while reading!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3vtFowc9zcQfvqsLAZ9Cx2?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

field notes: a freight app that works in a truck

![Transportation Company controls the night on one of Afghanistan’s most dangerous roads (Im](inline.jpg)

app: flutter + firebase for a transport company. drivers register trips, expenses, receipts with photos.
constraint: the network is a rumour.

---

## day 1: "offline support" is not a checkbox

turned on firestore persistence and the app read data offline immediately. tested it in airplane mode: list renders, cached values everywhere. looked done.

then the driver created a frete offline. the form submitted, the local list updated, and i closed the app. reopened it. the frete was there. **the office, however, saw nothing for six hours** when the phone finally found signal. that is when the real questions started.

## day 4: who makes the id?

server-generated ids cannot exist offline. the frete needs an identity the moment it is created, or the local list cannot reference it, and a retry cannot be deduplicated.

solution: uuid v4 on the device. the create is idempotent by construction: "create frete 8f3a..." repeated ten times is still one frete. the retry queue stopped needing cleverness because the identity was already stable.

## day 9: conflicts are business rules

two people edited the same frete: driver changed status, office corrected the commission. last-write-wins would silently delete one of them.

we stopped storing "the frete" as an editable row and started storing **facts**: status changes, expenses, delivery events. facts append; they do not conflict. commissions became a computed view. the only true conflicts left were physical reality (two people claiming different drop-off times), and those got a resolution screen, not a merge algorithm.

## day 15: receipts on a bad connection

photos are the heaviest thing a driver produces, and upload on a weak signal fails constantly. the rule: a receipt upload is never blocking. it sits in a retry queue with backoff, survives app restarts, and the trip is already saved without it. a half-synced state is normal here, not an error.

## day 21: testing like a driver

- airplane mode on, create, kill app, reopen, reconnect, verify.
- two devices, same frete, divergent edits.
- storage almost full.
- phone dies mid-upload.

unit tests never caught any of the interesting bugs. the interesting bugs all lived in the transitions between states of the world.

## closing note

the product promise is simple: the app never says "sem conexão, tente novamente". that sentence is the whole specification, and implementing it had almost nothing to do with network code and everything to do with **data modeling**: client ids, idempotent writes, facts instead of rows, queues that survive death.

sync is not a library you install. it is a set of decisions about identity, time and truth.

## image credits

- cover: [The Rusty, Trusty, Steed](https://www.flickr.com/photos/35557234@N07/9416346080) by Zach Dischner (by 2.0)
- image: [Modern fire truck minimizes fire hazard, Wheeling Downs, Wheeling, W. Va](https://www.flickr.com/photos/24029425@N06/9301354134) by Boston Public Library (by 2.0)
