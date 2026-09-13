---
title: the mailto link that disappeared (thanks, CDN)
date: 2026-07-15
description: Cloudflare rewrote my email into a span only JavaScript could decode. undoing it taught me to read my own HTML as a stranger.
img: /images/email-obfuscation-mailto/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

view-source dissection: the mailto that vanished from my own html

![Microsoft Type Cover 2 - IMG_4252](inline.jpg)

technique: read the deployed html like an attacker and a scraper would. the address was not there.

---

## curl does not lie

```html
<span class="canal-valor">
  <span class="__cf_email__" data-cfemail="5c3029352f1c2b352e3938722e2f">[email&#160;protected]</span>
</span>
```

and the link:

```
<a href="/cdn-cgi/l/email-protection#204c5549536057495245440e5253">
```

my browser showed `luis@wired.rs`. the raw html shows a cloudflare artifact and a hex blob. both are true. the difference is a script.

---

## what the cdn does, mechanically

cloudflare's scrape shield scans html for email patterns and replaces them with:

1. a `<span class="__cf_email__">` whose text is `[email protected]`,
2. a `data-cfemail` attribute: the address, xor'd byte by byte with the first byte as key,
3. a rewritten `href` pointing at `/cdn-cgi/l/email-protection#...`,
4. an injected script that reverses all of the above at runtime.

the blob is not encryption. decoding is a loop. i decrypted it in a few lines to confirm the encoded address was in fact the new one, not a cached old one.

the consequences:

- **without javascript**, visitors see `[email protected]`,
- **automated checks** of my own html see the wrong thing,
- **the link goes through cloudflare** rather than straight to mailto,
- **view-source and curl disagree with the browser**, which makes you doubt yourself first and the cdn second.

---

## the fix, layer by layer

**keep the text readable without js** by storing the `@` as an html entity. the browser decodes it; the scanner's regex does not see an email.

```html
<a href="mailto:luis&#64;wired.rs" data-email="luis&#64;wired.rs">luis&#64;wired.rs</a>
```

cloudflare rewrote the `href` anyway (it detects `mailto:`), so a second layer:

```js
const link = document.querySelector("a[data-email]");
if (link) link.href = "mailto:" + link.getAttribute("data-email");
```

the data attribute survives the rewrite. js restores the link. the no-js case still shows a readable address and points at cloudflare's redirect, which works.

---

## checklist for any cdn-rewritten html

- curl the deployed page, not just the browser tab.
- view-source it.
- test with javascript disabled.
- diff what you wrote against what is served.
- prefer data attributes for anything the cdn likes to rewrite.

middleboxes consider some of your html theirs to edit. the only way to keep the product intact is to serve them something they are happy to leave alone.

## image credits

- cover: [Rainbow fan sitting under black old fashioned typewriter keyboard keys](https://wordpress.org/photos/photo/90568630b0/) by Danielle Zarcaro (cc0 1.0)
- image: [Microsoft Type Cover 2 - IMG_4252](https://www.flickr.com/photos/15216811@N06/14158246545) by Nicola since 1972 (by 2.0)
