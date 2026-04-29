---
title: Redis is not just a cache
date: 2026-04-28
description: rate limits, locks and queues all fit in Redis — until you need delivery guarantees. knowing where the line is changed how I design services.
img: /images/redis-beyond-cache/cover.png
---

I used Redis for years as a cache: `SET`, `GET`, `EXPIRE`, done. Then I started needing the things caches don't promise — atomic counters, locks, queues — and Redis turned into a different tool. A more dangerous one, in a fun way.

## rate limiting: don't do it in two commands

The naive limit is:

```text
INCR key
EXPIRE key 60
```

There's a race between the two: a crash or a concurrent caller can leave a key without TTL, and then the counter never resets. The fix is not "add a transaction somewhere" — it's doing the whole thing **atomically**, server-side, in a Lua script: read the counter, set it if missing, set the TTL if it was just created, increment, and return the current value. One round trip, no race, no half state.

That's the first lesson: Redis is single-threaded for command execution, and a Lua script is one command. Atomicity is available — you just have to ask for it.

## locks: SET NX PX with a token

A distributed lock is `SET key value NX PX 30000`. Two details make it correct:

- `NX` — only one holder,
- `PX` — the lock expires, so a crashed process doesn't hold it forever.

And the value must be a unique token, because the release has to be conditional: "delete only if I'm still the owner". Otherwise a slow process releases a lock that already belongs to someone else — the classic bug that makes locks look like they work.

## queues: it depends on what "delivered" means

Lists and streams give you a queue: producers push, workers pop. Redis Streams even give you consumer groups and acks. That covers a lot.

But when I need retries with backoff, routing between consumers, dead-letter queues and observability over deliveries, I reach for **RabbitMQ**. The question is never "which is faster", it's "what does the broker promise when things go wrong".

- Redis: in-memory, simple, fast; persistence exists but the mental model is "best effort with options".
- RabbitMQ: durable queues, per-message acks, retry and dead-letter design as first-class.

## what I took from this

- Atomic beats clever. Lua scripts remove whole bug classes.
- A lock without an owner token is a suggestion.
- Choose a queue by its failure semantics, not its throughput.
- Cache, coordination and messaging are three different jobs that happen to share a daemon.

I still start with Redis for simple things — and I've stopped feeling clever about it.
