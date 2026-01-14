---
title: Cloudflare was serving my old JavaScript
date: 2026-01-13
description: the deploy was green, the HTML was new, the toggle didn't exist. CDNs cache URLs, not intentions.
img: /images/cloudflare-stale-javascript/cover.png
---

The deploy finished, the HTML was clearly the new one (new markup, new assets), and yet the page behaved like the old version. Buttons missing, enhancements dead. A hard refresh fixed it locally, which is always the worst kind of "fixed".

Then I looked at the headers:

```text
$ curl -sI https://portfolio.wired.rs/script.js
cache-control: public, max-age=14400
cf-cache-status: HIT
age: 1656
```

`age: 1656` — Cloudflare was serving a copy almost half an hour old, with a 4 hour TTL. And the file URL had never changed. `script.js` was still `script.js`. The CDN had no reason to fetch the new one, and cache headers alone weren't going to save me.

## why "no-cache" from origin didn't save me

My server was already sending `Cache-Control: no-cache` for HTML, and `max-age=3600` for JS/CSS. Cloudflare had its own idea of the TTL for JS/CSS (it can override origin TTLs, and it showed `max-age=14400`). Worse, browsers that had visited the old site had cached the old assets with `immutable, max-age=2592000` — 30 days — from the previous server configuration. Cache headers are a negotiation, and old promises don't expire when you change your mind.

## cache invalidation is a URL problem

The fix that actually works is to change the URL when the bytes change. Two parts:

1. In the repo, assets are referenced with a placeholder: `script.js?v=dev`, `styles.css?v=dev`.
2. The CI stamps the commit SHA before building:

```bash
V="${GITHUB_SHA::7}"
sed -i "s/?v=dev/?v=$V/g" public/index.html
```

Now every deploy swaps all asset URLs. Old copies don't matter, because nobody asks for that URL anymore. The CDN can cache forever; the next deploy simply points somewhere else.

For HTML the rule is the opposite: keep it short-lived or `no-cache`, because HTML is what points at the new URLs.

## what I took from this

- "Deployed" is not "served". Verify from the outside with `curl` and look for the version marker you expect.
- Caching is per URL. If you don't change the URL, you haven't invalidated anything; you've just asked politely.
- Stamp a version into every deploy. It's the cheapest correctness guarantee in web infrastructure.
- A CDN with its own TTL is a second system you don't control. Design so you don't need to.

I also stopped trusting old `immutable` headers: they are a promise to the browser, and you can't take promises back. You can only hand out a new URL.
