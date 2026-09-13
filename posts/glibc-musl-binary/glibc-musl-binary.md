---
title: glibc, musl, and the binary that refused to run
date: 2025-09-27
description: my CI got 2x faster and then the container crashed with "GLIBC_2.39 not found". this is what dynamic linking taught me.
img: /images/glibc-musl-binary/cover.jpg
---

You can find the code at: [github.com/luis-ota/songhunter](https://github.com/luis-ota/songhunter).

Listen to `Kraftwerk - The Robots` while reading!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5eqZWYQ5tbIehx00NeKXz7?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

I had a Rust service (SongHunter) that took about 5 minutes to build on every push, because everything was compiled inside the Docker build. I moved the compile step to the GitHub runner, cached `~/.cargo` and `target/` with `actions/cache`, and the build dropped to under 2 minutes. Great, right?

The container started. And then it crashed. In a loop.

```text
./songhunter: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.39' not found (required by ./songhunter)
```

## what actually happened

A compiled binary is not portable by default. My binary was built on the GitHub runner, which is Ubuntu 24.04 with **glibc 2.39**. My runtime image was `python:3.11-slim-bookworm`, which is Debian 12 with **glibc 2.36**.

Dynamic linking means the binary carries *symbol version requirements*, and at startup the loader checks if the system libc has them. 2.36 doesn't have 2.39 symbols. Crash.

The build machine and the runtime machine have to agree on the ABI. That's it. That's the whole story.

## the options

1. **Build for musl** (`x86_64-unknown-linux-musl`) and link statically. Truly portable, but dependencies that use C libraries (openssl, sqlite, etc.) can get painful.
2. **Build inside an older base** so the binary needs an older glibc. This is why a lot of projects build on `debian:bookworm` even if production runs newer: you can always run on newer glibc, never on older.
3. **Run on a runtime as new as the builder.** I picked this one: `ubuntu:24.04` as the runtime, which has glibc 2.39. I also moved yt-dlp to a Python venv there, because the pip package keeps extractors fresh.

## what I took from this

- `ldd ./binary` tells you what the binary needs. Do it when a container "starts but dies instantly".
- The error message is precise: it's not "missing library", it's "this version of the symbol doesn't exist".
- There's a direction to compatibility: newer glibc runs older binaries. Never the opposite.
- "It works on my machine" has a concrete meaning here: my machine is the build machine.

The funniest part? After the fix, the CI went from ~6 minutes (build + deploy) to a warm build of about 3 minutes, and the crash was replaced by a health check that actually passes. I'll take it.

## image credits

- cover: [Computer coding on a screen](https://www.rawpixel.com/image/432212/free-photo-image-code-binary-java) by Markus Spiske (cc0 1.0)
