---
title: a live game has no "reload" — building Zé Bot on TikTok LIVE events
date: 2025-12-28
description: Zé Bot turns TikTok LIVE gifts and chat into game commands. live systems teach you things deploy pipelines never will.
img: /images/zebot-live-events/cover.png
---

Zé Bot is a social game: viewers control a character through TikTok LIVE gifts and chat. The rule I wrote on day one and keep repeating: **the stream cannot stop for me**.

That single constraint changes every engineering decision.

## events arrive, and they don't wait

Gifts, comments and likes come in as a stream of events with no backpressure I control. If my handler blocks — calling an LLM, synthesizing voice, writing to disk — the queue grows and the game falls behind reality. So:

- critical interactions are **deterministic rules**, not AI calls,
- slow work (TTS, avatar reactions, narrative text) happens **after** the rule decides,
- every integration can fail without taking the stream down. A broken TTS means silence, not a crash.

That third one is the real lesson. "Degradação elegante" sounds like a buzzword until a live audience is watching you debug a stack trace.

## idempotency, or the same gift counts twice

Event streams retry. WebSocket decoders can see duplicates. If the same gift is processed twice, the audience sees the game lie — a $5 gift becoming a $10 effect.

Handling it means every event needs an identity, and state changes need to be idempotent: "apply gift X" instead of "add 10 coins". The second execution of the same event should be a no-op.

## privacy by minimization

I store only what the game needs: an event identifier, the interaction type, and whatever state it changes. Not viewer profiles, not histories of what people watched. It's less data to leak, less to explain, and it doesn't change the gameplay at all.

## what I took from this

- Live systems are the opposite of request/response: the world keeps moving while you process.
- Put the rule before the model. AI is a layer, never the scheduler or the bouncer.
- Design for double-processing from the first event; retries are a feature of every transport.
- Test degradation on purpose: kill the TTS, kill the LLM, keep the game playable.
- A live stream is the most honest QA environment I've ever worked in. It tells you instantly.

Deploys are easy when nothing is watching. This project is teaching me what infrastructure actually feels like when something is.
