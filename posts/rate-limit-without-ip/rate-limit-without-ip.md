---
title: rate limiting without ever storing an IP
date: 2026-02-10
description: the AfroRetratos anonymous feed needed abuse protection without collecting personal data. HMACs and a bit of discipline did it.
img: /images/rate-limit-without-ip/cover.png
---

AfroRetratos has an anonymous feed. That word — anonymous — is a design constraint, not a slogan. If I store raw IPs "just for rate limiting", the product is no longer anonymous, no matter what the UI says.

But an anonymous public form without rate limiting is a gift to whoever writes the first abuse script. I needed both: enforce limits, store nothing that identifies a person.

## the trick: a keyed hash as a stable pseudonym

For counting, you don't need the IP. You need something *derived* from it that is:

- stable (same visitor, same value, so counters work),
- unguessable (can't be reversed or enumerated),
- scoped (only valid for this app).

That's what an HMAC gives you:

```text
ip_hash = HMAC_SHA256(server_secret, client_ip)
```

I store `ip_hash`. Not the IP. The hash is deterministic, so I can count requests, apply a limit, and block an origin for a while — all without knowing who anyone is. If the secret leaks, hashes are compromised; that's why the secret is server-only and rotatable.

For the (rare) moderation case where the full picture matters, there's a second, optional field: the raw IP encrypted with AES-256-GCM, decryptable only in the admin panel. Off by default. Storing it is a deliberate choice, not a side effect.

## getting the client IP right

The other half of this problem is "which IP?". Behind a proxy, `X-Forwarded-For` is just a header — anyone can send it. The rule I implemented:

- trust `X-Forwarded-For` only from known proxies, and only the entry **N hops from the right** (`TRUSTED_PROXY_HOPS`),
- trust Cloudflare's `CF-Connecting-IP` only when the origin is conclusively behind Cloudflare (explicit flag),
- if nothing is trusted, treat the origin as unknown and apply limits globally.

The order matters too. My POST pipeline is:

```text
origin -> ip_hash -> blocked? -> rate limit -> validate -> persist -> public response
```

Blocking and limiting run *before* any parsing or database work, so abuse is cheap to reject.

## what I took from this

- Anonymity is an architectural property. "We don't show the IP" is not privacy if you keep it in a column.
- HMAC gives you accountability-shaped data (stable pseudonyms, blockable origins) without identity.
- Encryption at rest is for "we might need it for moderation". If you don't need it, don't store it at all.
- Proxy headers are attacker input until proven otherwise. Trust hops, not headers.

The public API response only ever contains `id`, `content`, `createdAt` and the event. Everything else lives where it belongs: in the moderation surface, behind a login, or nowhere.
