---
title: offline-first is a data modeling problem
date: 2026-06-16
description: a trucking app taught me that sync is not a library toggle. it's a set of decisions about identity, conflicts and retries.
img: /images/offline-first-flutter/cover.png
---

A freight management app for a transport company: drivers register trips, expenses, delivery receipts (with photos), commissions. Flutter + Firebase (Auth + Firestore). The feature list is ordinary. The requirement that changed everything: **it has to work in a truck**, which means it has to work offline, on bad connections, on a phone that gets closed abruptly.

## "offline support" is three separate problems

1. **Reading offline** — local cache. Firestore gives this with persistence enabled; done.
2. **Writing offline** — queue mutations and replay them when connectivity returns.
3. **Agreeing afterwards** — resolving what happens when two devices changed the same thing.

Most tutorials stop at step one. Step two is where idempotency lives. Step three is where product decisions live.

## identity has to be client-generated

If the server assigns IDs, you can't build a coherent local record while offline. So IDs are generated on the device (UUIDs). A trip created offline already has a stable identity, which makes retries safe: "create trip X" repeated ten times is still one trip.

## conflicts are business rules

When a driver's phone and the office dashboard both edit the same frete, who wins? There's no universal answer:

- **last write wins** is simple but can silently lose a receipt photo,
- **append-only events** (status changes, expenses) merge naturally because they don't overwrite,
- derived numbers (commissions) should be computed from the events, not stored as editable fields.

Turning "editable rows" into "events plus computed views" removed most conflict surface. The remaining conflicts were real-world ones — and those needed a human, not a merge function.

## design for the retry, not the request

Every write must be safe to repeat. Photos upload on their own with retry and backoff. A half-finished sync is a normal state, not an error state. And testing means airplane mode, force close, reconnect: the boring drills that catch what unit tests can't.

## what I took from this

- Sync is a data model: client IDs, idempotent writes, event-shaped facts.
- Offline-first is a UX promise. If the UI shows a spinner while offline, you broke it.
- Firebase gives you the transport, not the semantics. You still own the semantics.
- Test with the network off, or you're testing the happy path of a feature that exists for the unhappy path.

The drivers don't care about any of this. They care that the app never says "sem conexão, tente novamente". That's the whole spec.
