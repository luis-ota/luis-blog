---
title: Redis is not just a cache
date: 2026-04-28
description: rate limits, locks and queues all fit in Redis - until you need delivery guarantees. knowing where the line is changed how I design services.
img: /images/redis-beyond-cache/cover.jpg
---

Listen to `Cult Member - U Weren't Here I Really Miss You (slowed)` while reading!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0gCkIC8Zo808SZ1BzYIGwV?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

cookbook: three things you can make with one redis

![CCD Chip](inline.jpg)

same stock, three dishes. each recipe lists what it needs and what can go wrong.

---

## recipe 1: a rate limit that survives crashes

**serves:** any public endpoint
**time:** one round trip

ingredients

- one key per caller
- one counter
- one ttl
- one lua script

method

```lua
local n = redis.call("INCR", KEYS[1])
if n == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return n
```

the trick is that the increment and the expiry happen in a single command from redis's point of view. the two-command version, `INCR` then `EXPIRE`, can crash between them and leave a counter that never resets.

**do not:** add a transaction "somewhere" to fix a race. make the unit of work smaller than the race.

---

## recipe 2: a lock with an owner

**serves:** one worker at a time
**time:** 30 seconds, then it releases itself

ingredients

- `SET key token NX PX 30000`
- a unique token per holder
- an unconditional *conditional* delete

method

acquire with `NX` (nobody else holds it) and `PX` (a crashed holder doesn't lock forever). release with a script that deletes **only if the stored token is still yours**. otherwise a slow process deletes a lock that already belongs to someone else, and the bug looks like magic.

**do not:** `DEL key`. that is not a lock, it's a suggestion.

---

## recipe 3: a queue, and knowing when to leave redis

**serves:** background jobs
**time:** as long as the job takes

ingredients

- a list or a stream
- a worker that can retry

method

`LPUSH`/`BRPOP` is enough for "do this later". streams give you consumer groups and acks. for retries with backoff, routing, fanout and dead letters, stop cooking here: that is rabbitmq's kitchen.

**do not:** choose a queue by throughput. choose it by what it promises when the worker dies mid-job.

---

## plating

all three recipes live in the same daemon, which is the point and the trap. redis is fast and simple, and simplicity makes it easy to forget that "cache", "coordinator" and "broker" are three different jobs with different failure stories.

my rule: start with recipe 1 and 2, graduate to rabbitmq when delivery semantics matter, and never let the cache hold anything i can't rebuild.

## image credits

- cover: [Macro Computer](https://stocksnap.io/photo/macro-computer-O7NIMDXKMF) by One Idea LLC (cc0 1.0)
- image: [Electronic Detective by Ideal Toy Corporation, Copyright 1979 (Electronic Board Game) - Th](https://commons.wikimedia.org/w/index.php?curid=33068221) by Joe Haupt from USA (by-sa 2.0)
