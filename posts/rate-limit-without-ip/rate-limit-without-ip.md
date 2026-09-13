---
title: rate limiting without ever storing an IP
date: 2026-02-10
description: the AfroRetratos anonymous feed needed abuse protection without collecting personal data. HMACs and a bit of discipline did it.
img: /images/rate-limit-without-ip/cover.jpg
---

You can find the code at: [github.com/luis-ota/afroretratos](https://github.com/luis-ota/afroretratos).

ADR-001: rate limiting without storing identities

![Toll gate on Vijayawada - Hyderabad highway](inline.jpg)

architecture decision record. status: accepted.

---

## context

the afroretratos feed accepts anonymous posts. no account, no login, no identity. that is a product decision, not a missing feature.

an open anonymous form needs abuse protection. the obvious implementation stores the client IP and counts requests per address. that would quietly destroy the product promise: a table of IPs plus timestamps is an identity graph with extra steps.

the system also runs behind proxies (cloudflare, then nginx), so "the client IP" is not a given. `x-forwarded-for` is attacker input until proven otherwise.

---

## decision

derive a keyed pseudonym instead of storing the address.

```
ip_hash = HMAC_SHA256(server_secret, client_ip)
```

store only `ip_hash`. never the raw IP. use it for:

- counting requests in a window (rate limit),
- blocking an origin for a period after abuse (block list).

the hash is deterministic, so counters and blocks work exactly like they would with the IP. it is not reversible without the secret, so the data cannot be turned back into an address. rotate the secret and the pseudonyms change.

for the narrow moderation case where the full picture is needed, there is an optional encrypted field: `ip_encrypted`, AES-256-GCM, decryptable only in the admin panel. storing it is opt-in, not a side effect.

---

## getting the address right

- if `trusted_proxy_hops = n`, take the entry **n positions from the right** of `x-forwarded-for`, never the left.
- cloudflare's `cf-connecting-ip` is trusted only when the origin can *only* be reached through cloudflare (explicit flag).
- if nothing is trusted, treat the origin as unknown and apply the limit globally.

---

## pipeline order

```
origin -> ip_hash -> blocked? -> rate limit -> validate -> persist -> public response
```

blocking and limiting run before any parsing or database access, so abusive traffic is rejected cheaply and the expensive path stays clean.

---

## consequences

**positive**

- rate limiting and origin blocking work without collecting personal data.
- a leak of the database does not leak addresses.
- the moderation surface stays small and separate.

**negative**

- if the secret leaks, pseudonyms become reversible by brute force (IPv4 space is small). mitigation: rotate the secret.
- rotating the secret resets all counters and block decisions. acceptable for this system.
- an operator cannot answer "which IP did this?" without the encrypted field. that was the point.

---

## alternatives considered

- **store the IP plainly.** rejected: contradicts the product.
- **captcha on every post.** rejected: kills participation for a community of students.
- **no protection.** rejected: the form would be scraped into dust.

---

*the public API response contains `id`, `content`, `createdAt` and the event. everything else either lives in the moderation surface or does not exist.*

## image credits

- cover: [Abstract Light Painting](https://www.flickr.com/photos/124240658@N06/15821646318) by NiePhotography (by-sa 2.0)
- image: [North Korea - Highway traffic](https://www.flickr.com/photos/51812388@N02/5609363979) by Roman Harak (by-sa 2.0)
