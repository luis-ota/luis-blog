---
title: giving a deploy key a single job with SSH forced commands
date: 2025-10-21
description: my CI key had a full shell on a server with passwordless sudo. here is how I made it unable to do anything except deploy.
img: /images/ssh-forced-commands/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

the key that can only press one button

![Couple of metallic padlocks on old door frame](inline.jpg)

my CI had a shell. this is the story of taking it away, one option at a time.

## the line, annotated

this single line in `~/.ssh/authorized_keys` is the entire security model:

```
restrict,command="/usr/local/bin/deploy-portfolio" ssh-ed25519 AAAAC3...
```

read it as four decisions:

1. **`ssh-ed25519 AAAAC3...`** is the public key. Anyone holding the private half can open a session.
2. **`restrict`** turns off every optional feature of that session: no pty, no agent forwarding, no port forwarding, no X11, no user rc. The session becomes an execution channel, not a shell.
3. **`command="..."`** overrides whatever the client asks for. The client can beg for `bash`; the server runs the deploy script and returns its output.
4. **`/usr/local/bin/...`** is a root-owned file. The deploy user can execute it and cannot edit it.

## what the client sees

```
$ ssh -i deploy_key server 'id; whoami'
 frontend  Pulling
 backend   Pulling
 deploy ok
```

The requested command is not rejected with an error. It is replaced. There is no `id`, no `whoami`, no shell prompt. There is only the deploy, which is the point.

```
$ ssh -i deploy_key -tt server 'bash'
PTY allocation request failed on channel 0
```

With `restrict`, there is no terminal to allocate.

## what an attacker would try, and get

| attempt | result |
|---|---|
| run arbitrary commands | replaced by the forced command |
| open an interactive shell | no pty |
| scp a file to the server | the forced command runs instead; no transfer |
| forward a port through the server | forwarding disabled |
| edit what gets deployed | the script is root-owned; the key has no write path |
| inspect other services on the box | the session has no shell; the script only runs compose |

## why the compose lives inside the script

The first version of this setup accepted a `docker-compose.yml` from the workflow via `scp`. That was quietly the same as giving the key root on the host: a compose file can mount `/`, run privileged containers, join the host network.

So the compose moved **inside** the deploy script, as a heredoc. The key cannot send files, therefore the key cannot change *what* runs. A leaked key can only do one thing: trigger the same deployment again.

## the boring part that matters

For the static wired.rs site, the forced command is even simpler: `git fetch && git reset --hard origin/main` in a clone of a public repo. The key cannot write code (only GitHub can). It cannot publish containers. It presses "update", and nothing else.

## the checklist I now apply to every deploy key

- Is it dedicated to one job, or is it a personal key with extra powers?
- Does the forced command exist, and is it root-owned?
- Can the key write anything the command reads?
- Does the script validate the result, or just run?
- If this key leaked tomorrow, what is the worst it could do? If the answer is longer than one sentence, it is not done.

Security is often described as adding locks. This one was about removing a shell.

## image credits

- image: [Couple of metallic padlocks on old door frame](https://www.flickr.com/photos/10361931@N06/4268291295) by Horia Varlan (by 2.0)
- cover: [Canvas](https://www.flickr.com/photos/36006949@N00/5465456440) by DeclanTM (by 2.0)
