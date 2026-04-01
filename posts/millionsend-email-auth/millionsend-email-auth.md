---
title: email is a deliverability problem, not an SMTP problem
date: 2026-03-31
description: building MillionSend taught me that "sending" an email is the easy half. the protocol is the boring part; reputation is the product.
img: /images/millionsend-email-auth/cover.png
---

[MillionSend](https://github.com/luis-ota/millionsend) is an open-source email platform: bring your own AWS SES, get a Resend-compatible API, dashboard, contacts, broadcasts, webhooks. The interesting part was not the API. It was discovering how much of "email" has nothing to do with sending bytes.

## the stack nobody sees

An email that reaches the inbox passes through authentication layers:

- **SPF** — which servers may send for this domain,
- **DKIM** — a cryptographic signature on the message,
- **DMARC** — the policy that ties the two together and tells receivers what to do when they disagree.

Get one wrong and your mail goes to spam, silently, forever. That's why MillionSend has guided DNS verification and lets you bring your own DKIM key (BYODKIM) instead of hiding the mechanics behind a vendor.

The mental shift: mail providers don't evaluate *your code*, they evaluate *your domain's reputation*.

## bounces and complaints are data

The other half is what happens after you send:

- hard bounces and spam complaints must be **suppressed automatically** — resend to a hard-bounced address and you're training receivers to distrust you,
- metrics should track bounce and complaint rates against provider thresholds before they become account suspensions,
- unsubscribe has real semantics: RFC 8058 one-click, `List-Unsubscribe` headers, and a hosted page that actually works.

So the data model has a name I kept returning to: the suppression list is not a feature, it's a safety mechanism.

## idempotency, again

A send is a side effect with no transaction. Retries are unavoidable — timeouts happen, clients retry. That's why the API accepts an `Idempotency-Key`: the same key returns the same result instead of sending twice. For batch sends, it's the difference between a bug and a disaster.

## webhooks are a contract

Signed deliveries (Standard Webhooks / Svix-style headers), per-endpoint event selection, a delivery log, and bring-your-own signing secret. If your webhook consumer is down, you need to be able to see that and replay.

## what I took from this

- Sending is easy; being trusted is engineering.
- Every outbound side effect needs an idempotency story.
- Deliverability features (suppression, unsubscribes, authentication) are retention features in disguise.
- Building a "compatible" API (Resend-shaped) forces you to respect details you'd otherwise skip.

Email is one of those protocols that looks legacy until you try to make it reliable.
