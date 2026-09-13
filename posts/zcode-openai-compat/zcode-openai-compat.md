---
title: "lying to a client, politely: building an OpenAI-compatible proxy"
date: 2026-03-31
description: zcode-opencode-provider exposes a local app-server as an OpenAI-shaped API. compatibility layers are translation problems, and the contract is the product.
img: /images/zcode-openai-compat/cover.jpg
---

contract diff: what an OpenAI client expects vs what my proxy returns

![Modem, DVD Burner and SATA cable computer upgrades](inline.jpg)

a compatibility layer is a promise. this is the diff I maintain for `zcode-opencode-provider`.

---

## the request

client sends:

```json
{
  "model": "glm",
  "messages": [{ "role": "user", "content": "hello" }],
  "stream": false
}
```

proxy translates it for the local app-server and back. the shape is easy. the *contract* is everything around it.

---

## contract diff

| client expects | mvp delivers | gap |
|---|---|---|
| `choices[].message.content` string | yes | none |
| `finish_reason` semantics | `stop` only | no `length`, no tool calls |
| `usage` token accounting | approximate | upstream does not expose exact counts |
| streaming (`stream: true`) | rejected with a clear error | not faked |
| tool calls | out of scope | client must not rely on them |
| session resume | out of scope | each request is independent |
| error shape with `error.message` | yes | same shape as OpenAI |
| auth | none | localhost-only by design |

the tempting move is to accept `stream: true` and return one big chunk. clients then believe they support streaming, branch on deltas, and break in ways I cannot reproduce. a compatibility layer that lies about capabilities moves the bug into the caller's codebase.

---

## security posture, stated in the readme

- binds to `127.0.0.1` only,
- no authentication, because there is no remote access,
- credentials are read by the original app-server; the proxy never sees or logs keys.

the readme says "do not expose this" because a local-only service with no auth becomes a public open service the moment somebody changes a bind address. defaults are security decisions.

---

## what the mvp deliberately is

one request at a time, text prompts, non-streaming responses. that is a scope statement, not an apology. every unimplemented feature is listed as unimplemented, so a user can decide whether the proxy fits before integrating it.

---

## the general lesson

when integrating two systems, write the mismatch list first. mine looks like this and it is the most useful page of the repository:

- behavioral gaps (what works differently),
- missing features (what does not exist),
- security assumptions (what must stay true for this to be safe),
- upgrade risks (what breaks when the upstream changes).

adapters fail in the *seams* between two cultures, not inside either one. the seam is the product.

## image credits

- cover: [Leaf Aptus remote battery (self-made)](https://www.flickr.com/photos/10292464@N06/5463758826) by boingr (by-sa 2.0)
- image: [Modem, DVD Burner and SATA cable computer upgrades](https://www.flickr.com/photos/94012640@N00/8596593641) by Cindy Sue Causey (by 2.0)
