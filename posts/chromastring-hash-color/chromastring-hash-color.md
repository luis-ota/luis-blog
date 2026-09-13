---
title: deterministic colors - turning any string into a color that matches
date: 2025-11-05
description: ChromaString makes a stable color out of any text. the interesting part is not the hash, it's making the result readable.
img: /images/chromastring-hash-color/cover.jpg
---

three attempts at turning text into a color

![$h*! my Dad paints](inline.jpg)

a design diary, with the two versions that were bad.

---

## v0: the hash, unconstrained

the first version was ten lines. hash the string, take the low bytes, print hex.

```
"luis"     -> #3f7a12
"wired"    -> #0b0b1c
"lain"     -> #7f7f80
```

the algorithm was correct and the output was useless. half the colors were too dark to see on a dark background, two of them were nearly gray, and one looked like a highlighter stain. uniqueness is not the same as usefulness.

**killed because:** deterministic, yes. legible, no.

---

## v1: hex is the wrong space to think in

the second attempt generated RGB directly and tried to "brighten" results by multiplying. this is worse than it sounds: scaling RGB changes saturation and hue as a side effect, so bright colors drift toward pastel and dark colors stay muddy. I was fighting the color space instead of using one built for the job.

**killed because:** you cannot reason about readability in RGB. values are not perceptually meaningful.

---

## v2: hue from the hash, S and L constrained

the version that shipped uses HSL and treats each channel as a separate decision:

- **H** = hash mod 360. this is the part that makes the color "belong" to the string.
- **S** = 55-75%. a floor, so nothing turns gray; a ceiling, so nothing screams.
- **L** = 42-62%. the band where the color works as a background with light text, and as dark text on a light surface.

the conversion to hex happens at the very end. the hash never touches brightness.

```
"luis"  -> #3f7a12  hsl(101 74% 46%)
"wired" -> #c25a3c  hsl(14 54% 50%)
"lain"  -> #7b6ac2  hsl(253 43% 59%)
```

same strings, same reproducibility, now legible.

---

## margin notes

the interesting part wasn't the function. it was discovering that "generate a color" is really "generate a color *under constraints*", and that constraints belong to the space you're working in. in RGB, readability is an emergent accident. in HSL, it's a number line.

I kept the service simple (Vite, React, no backend), but the constraint model is the actual content of the tool. the interface is just a text box.

next time I'd experiment with OKLCH, which is even better behaved than HSL. for now, HSL solved the problem I had.

---

*the source is at [github.com/luis-ota/chromastring](https://github.com/luis-ota/chromastring). it is a toy, and it taught me more about color than any picker ever did.*

## image credits

- cover: [Blur-2](https://www.flickr.com/photos/97425966@N05/9135832665) by maxmadesign.com (by 2.0)
- image: [$h*! my Dad paints](https://www.flickr.com/photos/51668926@N00/4996206922) by ruffin_ready (by 2.0)
