---
title: giving a deploy key a single job with SSH forced commands
date: 2025-10-21
description: my CI key had a full shell on a server with passwordless sudo. here is how I made it unable to do anything except deploy.
img: /images/ssh-forced-commands/cover.png
---

I automated the deploy of my portfolio with GitHub Actions: the workflow connects over SSH and runs `docker compose pull && docker compose up -d`. Simple. Then I looked at what that key actually was.

It was an ed25519 key with **full shell access** as `ubuntu`, and `ubuntu` has passwordless sudo on that box. If that private key ever leaked, whoever had it owned the entire server. The deploy automation was fine; the blast radius was absurd.

## the fix: one key, one command

`~/.ssh/authorized_keys` accepts options before the key. The important one:

```text
restrict,command="/usr/local/bin/deploy-portfolio" ssh-ed25519 AAAAC3... deploy-key
```

Two parts:

- `restrict` turns off everything else: no pty, no port forwarding, no agent forwarding, no X11, no user rc.
- `command="..."` forces that exact command to run for **any** session opened with that key. If the client asks for `id`, the server ignores it and runs the deploy script anyway. If the client tries `scp`, the forced command runs and the transfer fails.

I tested it the right way — by trying to break out:

```bash
ssh -i deploy_key server 'id; whoami'   # prints the deploy output, no id, no whoami
ssh -i deploy_key -tt server 'bash'     # PTY allocation request failed
```

## the script is the security boundary

The forced command only helps if the command itself is safe. Mine is a root-owned script (not writable by the deploy user) that:

1. writes the `docker-compose.yml` from a heredoc **embedded in the script** (the key cannot send files),
2. pulls the image,
3. recreates the container,
4. curls a health endpoint and exits non-zero if it fails.

The key can't change what gets deployed. It can only press the deploy button. The worst a leaked key can do is... deploy the same thing again.

For a static site I went even simpler: the forced command runs `git fetch && git reset --hard origin/main` in a clone of the public repo, and nginx serves that directory. No filesystem writes from CI at all; GitHub itself is the source of truth.

## what I took from this

- A deploy key is a credential for a *job*, not for a person. Scope it like a job.
- `restrict,command=` is the cheapest security upgrade I've ever shipped.
- If the deploy needs to run on a server with `sudo`, keep the key far away from that ability.
- Audit what your keys can do, not what your workflow does. The workflow was never the problem.

Since then I have four of these keys on two servers, each capable of exactly one script, and I sleep better.
