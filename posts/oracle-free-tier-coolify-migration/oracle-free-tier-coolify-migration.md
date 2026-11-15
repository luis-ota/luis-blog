---
title: rebuilding everything on oracle's free tier, at zero cost, in one night
date: 2026-11-15
description: three vms, one coolify, eighteen apps, a billing scare, twenty rogue instances and a ci/cd that finally points at the right place. what broke and what i'd do again.
---

Listen to `lofi hip hop for people who have no money` while reading!

I had one rule for this migration: **it must cost exactly zero.** Not "almost zero". Zero. I'm not in a position where a surprise invoice is a funny anecdote, so every command that touched the cloud had to pass a mental "can this bill me?" check first.

This is the story of tearing down my whole infrastructure on Oracle Cloud's Always Free tier and rebuilding it from scratch, with an AI agent doing the typing while I mostly yelled "in background!" at it.

## where we started

A pile of things that had grown organically:

- two tiny 1 GB VMs running a bunch of side projects, some with plain `docker compose`, some with systemd units, some with forced-command SSH keys for deploys
- a bigger VM for [ai.ther](https://ai.ther.social), my main product
- a 167 GB boot volume that was a leftover from an earlier experiment, and that quietly produced a **R$ 11.92 charge** I had to chase through support
- deploys that all ended in `ssh user@host` into a machine I was about to delete

The goal: one place to manage everything (Coolify), one strong machine for the product, the rest split across the small ones, everything on my Tailscale network, and a CI/CD that works without me.

## the plan

Oracle's Always Free gives you, roughly:

| resource | amount |
|---|---|
| Ampere A1 (ARM) | 4 OCPU / 24 GB total, split as you like |
| AMD E2 Micro | up to 2 VMs, 1 GB RAM each |
| block storage | 200 GB total |

A common claim in forums is that older accounts keep the original 4 OCPU / 24 GB. I did not trust forum claims with my money, so I read the current docs and then **capped the account with a quota policy** so that nothing above the free limits could even be created. More on why that mattered in a second.

The layout I settled on:

- **core**: A1, 2 OCPU / 12 GB. Coolify itself plus the heavy apps (ai.ther, the leads bot, a Postgres).
- **sides-a**, **sides-b**: the two E2 Micros, as remote servers managed by the Coolify on core.

Three boot volumes of 50 GB each. 150 of 200 GB used, nothing extra attached.

## the first mistake: twenty instances

Here is the part I'm least proud of. The first attempt at creating the VMs was a retry loop. Oracle's free A1 capacity is famously scarce ("out of host capacity"), so the loop kept trying. The trouble: some attempts *did* succeed while the loop didn't notice, and I opened the console to find roughly **twenty instances** running.

Nothing billed, because they were all within shape limits and free, but my stomach dropped anyway. The fix was a rule I now apply to any cloud automation:

> **Create one. Verify it exists. Only then decide whether to create another.**

We wrote a "safe launch" script that lists existing instances *before every attempt*, refuses to proceed if one with the target name already exists, and exits on the first success. We also put a hard budget alert (R$ 20) and the quota policy in place, so a bug in a future loop hits a wall instead of my wallet.

## teaching one machine to run everything

Every app became a Coolify application. No more compose files floating in home directories. Roughly:

1. **Back up first.** Both old VMs, plus the ai.ther data, copied off and checksummed *before* a single delete.
2. **Delete the old Oracle resources**, then recreate VCN, subnet, internet gateway and security lists cleanly.
3. **Bootstrap each VM**: updates, Docker, Tailscale, firewall, fail2ban.
4. **Install Coolify on core**, then add the two sides as remote servers.
5. **Restore ai.ther**, then add apps one by one and check each URL returns 200.

At the end, fifteen public domains answered 200.

### lessons from the network side

- **Let's Encrypt kept failing with 522 errors** behind Cloudflare. The reliable fix was a **Cloudflare Origin Certificate** on the origin plus SSL mode **Full (strict)**. Clean, and no renewal dance.
- **Security list for SSH**: port 22 only from my own IP and from core. Everything else goes over Tailscale.
- At one point a proxy on one of the sides came up listening **only on IPv6**, which produced mysterious 521s. A restart fixed it, but it cost an hour of staring.

## the small machines are small

The E2 Micros have 1 GB of RAM. Coolify wants to be helpful, and one of its helpful features is **image vulnerability scanning**, which ran `grype` and ate about 55% of a CPU on a machine that has barely any. I disabled scanning on the sides. Observability is nice; a server that can't answer SSH is not.

I also moved the leads bot from a side to core. It simply didn't fit in 1 GB. And instead of spawning one Postgres per app, ai.ther's Postgres now hosts a second database for the leads bot. **One database server, several databases.** Less RAM, fewer things to back up.

## ARM vs AMD, the quiet trap

core is ARM. The sides are AMD. An image built for one will refuse to start on the other, with the lovely error `exec format error`. The leads image needed an explicit ARM64 tag and a build that actually produces ARM64. The ai.ther build job runs on a native ARM runner so it doesn't pay the emulation tax.

If you mix architectures in a Coolify setup, **put the architecture in the image tag.** Future you will thank you.

## the real work: ci/cd

After the infrastructure was alive, I asked a simple question: *which of my projects actually deploy automatically?* The honest answer was **none**. Every workflow ended with `ssh` into a VPS that no longer existed.

The new pattern, used everywhere:

```
git push
  -> GitHub Actions builds the image
  -> pushes it to GHCR
  -> calls the Coolify API: "deploy this app"
```

For apps that use `:latest`, the final step is just a POST to the deploy endpoint. For ai.ther, I wanted every deploy to be reproducible, so the workflow first **PATCHes the app's image tag to the commit SHA** and then triggers the deploy. Rolling back is "set the tag to an older SHA".

A few things I learned wiring eleven repos:

1. **Do not touch a dirty working tree.** My local ai.ther checkout had 43 modified files and 11 untracked ones. Rebases, stashes and merges all aborted. Instead of fighting git, I edited the workflow **through the GitHub contents API**, leaving my local state untouched. Odd, but safe.
2. **`GITHUB_TOKEN` can't always push to GHCR** for a repo whose package was created elsewhere (`permission_denied: read_package`). A personal token with `write:packages` fixed it. For a long-lived setup, a fine-grained token scoped only to packages is the better choice.
3. **Secrets belong in a secret store.** The Cloudflare API token lived in my desktop keyring, not in a file. Asking `secret-tool` for it was the only reason the agent could create a DNS record without me pasting anything.
4. **Some projects use CircleCI**, not GitHub Actions. Same idea, different CLI: set the context secrets with `circleci context secret set`, add an `image` job that builds ARM64, and let the `deploy` job call the Coolify API.
5. **A failed deploy can hide behind a green one.** Each time, I checked the real URL instead of trusting the pipeline status.

## moving the dashboard

Halfway through, I decided Coolify should live at `coolify.wired.rs` instead of an old domain, since it now manages *all* my projects, not just one.

That sounds like a DNS change. It isn't. Coolify keeps its public URL in three places: the instance settings in its database, the `APP_URL` in its env file, and the generated Traefik dynamic config. Hand-editing only the proxy file (my first attempt) produced a 404 on the old name while the new one wasn't wired yet.

What actually worked:

1. Create the Cloudflare DNS record (proxied).
2. Change the instance URL in Coolify and regenerate its proxy config.
3. Update `APP_URL` and recreate the Coolify container.
4. Leave a 301 from the old hostname to the new one.
5. Update every workflow that referenced the old host.

## things that surprised me

- **A static proxy file from the old setup silently overrode Coolify.** `wired.rs` returned 502 because a hand-written `wired.yml` still pointed at a container that no longer existed. Removing that file let Coolify's own routing take over. Lesson: *when you move to a manager, delete the old hand-rolled config.*
- **A missing network alias broke a frontend.** The downloader's nginx proxies to `http://backend`, but in Coolify the container has a generated name. Setting a network alias called `backend` on the API app fixed it.
- **Environment drift is real.** One app (a marketplace) came back "healthy" in Coolify but never actually served traffic: the new image validates its environment at boot and requires variables the old VPS never had. I deliberately left it down rather than guess at payment secrets. A healthy container isn't a working app.
- **Persistent storage is easy to forget.** A small app stores its SQLite file inside the container. Every redeploy recreates it. I noted it for a volume later.

## "is the disk too small?"

My main product runs on core, so I asked whether 50 GB was enough. The numbers:

| item | size |
|---|---|
| disk | 48 GB, 19 GB used, **29 GB free** |
| docker images | 11 GB |
| docker volumes | 4.4 GB |
| ai.ther database | 11 MB |
| ai.ther storage | 3.6 MB |

The database is nothing. The risk is **uploaded media**: production uses the local `public` disk, images get re-encoded as JPEG at quality 100, and video uploads can reach 1 GB. Back-of-the-envelope, local disk holds a couple hundred light-use workspaces for a year, but only around fifteen medium ones, and one or two heavy ones.

Two free fixes: grow the volume from 50 to 100 GB (the account still has 50 GB of quota left) and, better, point media at Cloudflare R2, which the app already supports. The disk stops being the bottleneck.

## what i'd do again

- **A quota policy and a budget alert before anything else.** A guardrail you set up *after* the mistake is just a nice story.
- **One resource at a time.** Create, verify, continue.
- **Back up, checksum, then delete.**
- **Everything through the manager.** If it isn't a Coolify app, it doesn't exist.
- **Verify with the real URL.** Status badges lie politely.
- **Keep secrets out of the repo, the chat and the logs.** A keyring and CI secrets are enough.

## what i'd do differently

- Write the safe launch loop *before* the first launch.
- Check architecture (ARM vs AMD) before choosing where each app lives.
- Decide on object storage for media on day one.
- Don't discover "none of my deploys work" at the end. Test one pipeline end to end early.

## where it stands now

- 3 VMs, 150 of 200 GB used, nothing attached that bills
- 1 Coolify, 18 apps, all managed
- 11 repos deploying through CI to the Coolify API
- everything reachable over Tailscale, SSH locked down, Cloudflare in Full (strict)
- cost this month for the new setup: **R$ 0**

Not bad for a night of yelling at a terminal.
