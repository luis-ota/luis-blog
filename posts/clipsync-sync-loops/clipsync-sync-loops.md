---
title: clipboard sync and the loop that never ends
date: 2026-01-27
description: clipsync keeps the clipboard shared between Linux and Android. the hardest bug wasn't the network - it was two devices agreeing too much.
img: /images/clipsync-sync-loops/cover.jpg
---

[clipsync](https://github.com/luis-ota/clipsync) syncs the clipboard between my Linux machine and my Android phone (and macOS/Windows builds). LAN-first, with a self-hosted relay when devices are apart. The obvious hard parts - encryption, pairing, NAT - were fine. The bug that kept biting was philosophical: **both sides kept syncing each other's sync**.

![Phone](inline.jpg)

## the echo loop

Device A copies "hello" → sends to B → B writes "hello" to its clipboard → B's clipboard watcher sees a change → B sends "hello" to A → A writes it → A's watcher fires again...

The clipboard is a stateful global that anyone can write. There's no "origin" field. So a real sync layer needs to *manufacture* the missing metadata.

What worked:

- attach an **origin id and a revision** to every sync message,
- when applying a remote value, remember the fingerprint of what you just wrote,
- ignore watcher events that match a value you applied (with a short time window),
- never re-broadcast a value that didn't come from a local user edit.

In other words: the system maintains a tiny piece of state - "this change was mine, not the user's".

## content types are not strings

Clipboards carry more than text: HTML, images, file lists. Some apps publish multiple formats for one copy. Sending the wrong representation means pasting broken content on the other side. My rule: negotiate the richest format both sides support, and fall back deliberately, not accidentally.

## pairing without an account

There is no login. Devices find each other, show a fingerprint, and confirm a shared secret out of band. After that, an authenticated, encrypted channel. A relay never sees plaintext - it forwards bytes it cannot read. Self-hosting the relay is a config line, not a second product.

## what I took from this

- Distributed state needs provenance. If the platform doesn't provide it, you invent it.
- Watchers that react to your own writes need damping. Every UI-framework developer learns this; it applies to any observable global.
- "No account" is an architecture choice, and it's usually the right one for a personal tool.
- Rust made me very aware of ownership here: "who owns this clipboard change" stopped being abstract.

The CI ships a `clipsync-core` crate to crates.io and release binaries install with a checksum check. The satisfying part is that the hardest logic is the 50 lines about *not* doing something.

## image credits

- cover: [Clipboard Desk](https://stocksnap.io/photo/clipboard-desk-VXAISJRBH9) by Design by Matt (cc0 1.0)
- image: [Phone](https://www.flickr.com/photos/69670601@N05/15518829557) by Alexandra E Rust (by 2.0)
