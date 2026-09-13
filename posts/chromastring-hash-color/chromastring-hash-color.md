---
title: deterministic colors - turning any string into a color that matches
date: 2025-11-05
description: ChromaString makes a stable color out of any text. the interesting part is not the hash, it's making the result readable.
img: /images/chromastring-hash-color/cover.jpg
---

I built [ChromaString](https://github.com/luis-ota/chromastring) as a tiny tool: type text, get a color. Same text, same color, forever. The hard part isn't the hashing - it's making the color *good*.

![$h*! my Dad paints](inline.jpg)

## the obvious part

A deterministic function from string to color is trivial:

```js
function hash(text) {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
```

The hash gives you an integer. Now what?

## the part that took the thinking

If you map the hash straight to a hex value, most results are muddy or unreadable:

- `#0b0b0b` on a dark UI: invisible.
- `#fcfc00` on white: eye-searing and low contrast if used as text.
- `#7f7f7f` everywhere: technically unique, visually identical.

So I stopped generating "a color" and started generating **three constrained numbers**:

- **Hue** comes from the hash (this is what makes it feel unique).
- **Saturation** is floor-clamped, so you never get gray mush.
- **Lightness** is constrained to a readable band, so the color works as a background with white text or as an accent on a dark surface.

The output is HSL, converted to hex at the end. The distribution still looks random to a human, but every sample is usable.

## why deterministic colors are useful

This shows up more than I expected:

- avatars and user tags that are stable across sessions and devices (no database column needed),
- chart series where "the same entity" keeps its color after a refresh,
- generated art where you want reproducibility from a seed,
- hash-based UI where two people see the same thing for the same input.

The database-free part is my favorite: no storage, no sync, no migration. The string *is* the seed.

## what I took from this

- A hash gives you randomness, not design. You always need a mapping with constraints.
- Working in HSL makes "readable" an explicit choice instead of luck.
- Deterministic generation is a feature; it means two machines agree without talking.
- Tiny tools are great places to notice patterns you'll reuse in bigger systems.

It's a weekend project, but I keep reaching for the same idea: derive, constrain, convert.

## image credits

- cover: [Blur-2](https://www.flickr.com/photos/97425966@N05/9135832665) by maxmadesign.com (by 2.0)
- image: [$h*! my Dad paints](https://www.flickr.com/photos/51668926@N00/4996206922) by ruffin_ready (by 2.0)
