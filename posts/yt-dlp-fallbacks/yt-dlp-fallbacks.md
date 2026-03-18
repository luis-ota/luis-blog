---
title: yt-dlp extractors break every few weeks. plan for it.
date: 2026-03-17
description: TikTok and Instagram stopped working on two of my tools on the same week. same cause, same fix, and a fallback.
img: /images/yt-dlp-fallbacks/cover.png
---

Two of my projects download media from links (SongHunter identifies songs, DownloadAnyVideo extracts video formats). Both broke on the same week. The errors were different, which is typical:

```text
ERROR: [TikTok] 7675886233427414289: Unexpected response from webpage request;
please report this issue on https://github.com/yt-dlp/yt-dlp/issues

ERROR: [Instagram] DH56yy7p3lZ: Instagram sent an empty media response.
Check if this post is accessible in your browser without being logged-in.
```

Both services had yt-dlp installed, both were "working". The version was from a few weeks earlier. That's the whole bug.

## extractors are reverse-engineered, and platforms move

yt-dlp doesn't have an API contract with TikTok. When TikTok changes its web page or adds a challenge, the extractor has to be updated. That means yt-dlp is a dependency with an **expiration date measured in weeks**, not years.

The fix is boring: update it at build time, not "eventually".

```dockerfile
RUN python3 -m venv /opt/ytdlp && \
    /opt/ytdlp/bin/pip install --no-cache-dir -U "yt-dlp[default]" curl_cffi
```

Two details I learned here:

- The **pip package** and the **standalone binary** are not equivalent. The pip install with `curl_cffi` handled TikTok's JS challenge with yt-dlp's native Python solver, while the standalone binary failed on the same URL, same version.
- Some sites need browser impersonation, which `curl_cffi` provides. `--impersonate chrome` becomes possible only when that dependency is there.

## don't trust one path

Even with an updated yt-dlp, a challenge can fail. So I added a fallback for TikTok: when yt-dlp errors, the service calls **TikWM** (`https://www.tikwm.com/api/?url=...`), takes `data.play` and downloads the media directly. The audio pipeline (ffmpeg → wav) doesn't care where the file came from.

```rust
match self.run_ytdlp(&effective_url, &output_dir, &template).await {
    Ok(path) => Ok(path),
    Err(err) if effective_url.contains("tiktok.com") => {
        warn!(task_id, error = %err, "yt-dlp failed, falling back to TikWM");
        self.tikwm_fallback(&effective_url, &output_dir).await
    }
    Err(err) => Err(err),
}
```

And because I will absolutely forget to bump yt-dlp manually, both repos now have a **weekly scheduled rebuild**. The image gets the newest extractors once a week whether I think about it or not.

## what I took from this

- Treat scrapers as fragile dependencies: pin nothing, update on a schedule, and monitor.
- Fallbacks are a product feature. "It works today" was never the promise; "the tool tries hard" is.
- Keep URLs normalized before extraction (`/reels/` → `/reel/`, strip tracking params) — small things that remove whole classes of failure.
- If two of your tools break on the same day, look for the shared dependency before debugging each tool.

Since these changes, both tools survived the next wave of platform changes with zero downtime. That's the entire goal: the extractor breaks, and nobody notices.
