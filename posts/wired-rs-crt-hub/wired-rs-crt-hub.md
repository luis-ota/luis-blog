---
title: building wired.rs - a hub with a CRT soul
date: 2026-08-25
description: turning a list of links into a place. canvas networks, palette swaps with CSS variables, and an easter egg as a design-system test.
img: /images/wired-rs-crt-hub/cover.jpg
---

You can find the code at: [github.com/luis-ota/wired-rs](https://github.com/luis-ota/wired-rs).

Listen to `bôa - Duvet` while reading!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/42qNWdLKCI41S4uzfamhFM?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

[wired.rs](https://wired.rs) is the front door of my studio, Wired Layer Co. It's a hub: five tools, one page. I could have shipped a list of cards. Instead I treated it as a small argument for the kind of work I do - and it turned into one of my favorite builds.

![『If nothing happens - Check printer 』](inline.jpg)

## a metaphor that actually carries weight

The company is called **Wired Layer**. So the page is a layer stack: L0 to L4, each tool a node in the same network. That's not decoration; it's the information architecture. The hero draws the network on a `<canvas>` - nodes drifting, lines connecting whatever comes close. Cheap to render, calm to watch, and it sets the tone before any copy loads.

Technical details that made it feel alive without costing performance:

- the canvas resizes with `devicePixelRatio` capped at 2, so it's crisp on retina and cheap on phones,
- animation pauses on `visibilitychange`,
- with `prefers-reduced-motion`, it draws a single static frame.

## the palette swap trick

I wanted an easter egg. The page is phosphor green on near-black; the show it nods to has a red counterpart. Instead of maintaining two stylesheets, I made every color a CSS custom property and scoped an override:

```css
html[data-protocolo="7"] {
  --fosforo: #ff5f56;
  --fosforo-fraco: #9b3a34;
}
```

One attribute flips the whole site - buttons, HUD, links, canvas colors (the script reads the same attribute). This is the strongest argument I've found for designing with tokens: **theming becomes an assignment**.

## the easter egg is a QA suite

Type `lain` anywhere and "Protocol 7" takes over: red palette, glitch, a dialog. It exists as a joke, but building it forced me to handle real things:

- keyboard detection that ignores modified keys and editable fields,
- a modal with focus management, `Escape` to close, click to dismiss,
- translation of all dialog copy in both languages,
- reduced-motion behavior,
- and a HUD hint (`seq: ____`) that fills in as you type - discovery without spoiling.

If a feature survives both languages, keyboard-only users and reduced motion, it's not a toy. It's a stress test.

## what I took from this

- CSS variables are a theming architecture, not a convenience.
- Canvas animation is cheap when it's small, paused off-screen and static for reduced motion.
- An easter egg is a privacy-free way to show craft - and a demanding user of your design system.
- Small sites deserve real engineering; constraints like "no framework, static files" make the decisions visible.

The deploy is a `git pull` behind a forced-command SSH key. The page is a handful of files. It feels like the whole studio in one screen, which is exactly the point.

## image credits

- cover: [Retro computer w/ floppy drive, keyboard](https://sketchfab.com/3d-models/4a3fd162531d4dbe9cf00bcdfde4df01) by David Jalbert (by-sa 4.0)
- image: [『If nothing happens - Check printer 』](https://www.flickr.com/photos/49832497@N02/9754578134) by Kyra Ocean Rehn ♡ (by 2.0)
