---
title: the mailto link that disappeared (thanks, CDN)
date: 2026-07-15
description: Cloudflare rewrote my email into a span only JavaScript could decode. undoing it taught me to read my own HTML as a stranger.
img: /images/email-obfuscation-mailto/cover.png
---

I changed an email address on my portfolio, deployed, and the contact section showed `luis@wired.rs` in my browser. Done, right? Then I curled the page:

```html
<span class="canal-valor">
  <span class="__cf_email__" data-cfemail="5c3029352f1c2b352e3938722e2f">[email&#160;protected]</span>
</span>
```

The address was gone. In its place, a Cloudflare artifact and a hex blob. The `mailto:` link had also been rewritten to `/cdn-cgi/l/email-protection#...`.

## what the CDN was doing

Cloudflare's **Email Address Obfuscation** (Scrape Shield) scans HTML and replaces anything that looks like an email with an encoded span, then injects a script that decodes it in the browser. It's an anti-scraper feature. It works. But it has side effects worth knowing:

- the page requires JavaScript to show the address,
- no-JS visitors see `[email protected]`,
- "view source" and `curl` show something different from what users see,
- any automated check of your own HTML is now wrong.

The blob isn't encryption. It's a per-byte XOR with the first byte as the key — you can decode it in a couple of lines. I did, mostly to confirm it was my new address and not a stale cached one.

## the fix, in two layers

I wanted three properties: the address visible in the HTML, the `mailto:` working, and no dependency on the CDN's script.

1. **Hide the pattern from the scanner.** Browsers decode HTML entities, Cloudflare's regex doesn't see a plain email:

```html
<a href="mailto:luis&#64;wired.rs" data-email="luis&#64;wired.rs">luis&#64;wired.rs</a>
```

2. **Restore the `href` in JavaScript**, in case the CDN still rewrites it — the `data-email` attribute survives:

```js
const link = document.querySelector("a[data-email]");
if (link) link.href = "mailto:" + link.getAttribute("data-email");
```

The text is now correct with JS disabled; the link is correct whenever JS runs.

## what I took from this

- Your HTML is not always your HTML. Middleboxes rewrite what they consider risky or messy.
- Test the page as a scraper: `curl`, no JS, view-source. If you only test the browser, you're testing one version of your site.
- Anti-spam features trade accessibility and transparency. Know what you're trading.
- A data attribute plus a tiny bit of JS is a reliable escape hatch.

Since then I check one curl per deploy, every time. It takes three seconds and has caught two bugs already.
