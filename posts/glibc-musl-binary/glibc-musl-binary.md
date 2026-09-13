---
title: glibc, musl, and the binary that refused to run
date: 2025-09-27
description: my CI got 2x faster and then the container crashed with "GLIBC_2.39 not found". this is what dynamic linking taught me.
img: /images/glibc-musl-binary/cover.jpg
---

You can find the code at: [github.com/luis-ota/songhunter](https://github.com/luis-ota/songhunter).

Listen to `Aphex Twin - Pulsewidth` while reading!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/1jScAJOKsMuB1FIlYAblu1?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

## incident summary

![Algorithmic Contaminations](inline.jpg)

| | |
|---|---|
| **what** | every deploy of SongHunter produced a container that started and died within seconds |
| **when** | the day I moved the Rust build from Docker to the GitHub runner |
| **impact** | tool offline; no data loss; nobody noticed except me and the 502s |
| **detection** | smoke test in the deploy script (`curl` to the health endpoint) |
| **resolution** | runtime image switched to match the builder; yt-dlp moved to a venv |
| **time to fix** | about 20 minutes, most of it spent disbelieving the error |

## the symptom

```
./songhunter: /lib/x86_64-linux-gnu/libc.so.6:
  version `GLIBC_2.39' not found (required by ./songhunter)
```

The container was healthy by every other measure. The image built. The process started. It just could not load.

## timeline

**17:02** build moved to the runner. `actions/cache` on `~/.cargo` and `target/`. Build time drops from ~5 minutes to ~2.

**17:18** deploy green, smoke test red. Container in a crash loop.

**17:21** first hypothesis: broken image. Rebuilt. Same error.

**17:26** `ldd` on the binary inside the image shows missing symbol versions, not missing libraries. That reframes everything.

## the actual cause

The binary was compiled on Ubuntu 24.04 (**glibc 2.39**). The runtime image was `python:3.11-slim-bookworm`, which is Debian 12 (**glibc 2.36**).

A dynamically linked binary records *which versions of libc symbols it needs*. At startup, the loader checks the host. 2.36 does not contain the 2.39 symbols. The process never reaches `main`.

This is not a bug in my code, not a corrupted image, and not a Docker problem. It is an ABI contract between two machines, and I had broken it in the most boring way possible.

## resolution

I chose the runtime that matches the builder instead of downgrading the builder:

```dockerfile
FROM ubuntu:24.04 AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl ffmpeg libchromaprint-tools \
    python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/ytdlp \
    && /opt/ytdlp/bin/pip install --no-cache-dir -U "yt-dlp[default]" curl_cffi
```

The other two options were building for musl (painful with C dependencies) and building inside an older base (works, but then the toolchain in CI lags). Matching glibc was the smallest honest fix.

## five whys, correctly ordered

1. Why did the container die? The loader could not find required symbol versions.
2. Why? The binary needed glibc 2.39; the runtime had 2.36.
3. Why? I built on a newer OS than I ran on.
4. Why did I do that? Because the build was faster on the runner and I moved it without re-checking the runtime base.
5. Why did I not notice earlier? Because "Container Started" is not a health check. The smoke test caught it, and that is the only reason the incident ended in 20 minutes.

## what changed in the process

The deploy script now fails loudly on an unhealthy response, and the runtime base is treated as part of the build contract, not as an afterthought. `ldd` is the first command I run when something "starts" but does not respond.

A build that succeeds is not a working artifact. It is a hypothesis about the machine that will run it.

## image credits

- cover: [Computer coding on a screen](https://www.rawpixel.com/image/432212/free-photo-image-code-binary-java) by Markus Spiske (cc0 1.0)
