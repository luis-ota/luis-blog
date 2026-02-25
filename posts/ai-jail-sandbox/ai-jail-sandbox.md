---
title: sandboxing an AI agent is a permissions problem, not a Docker problem
date: 2026-02-24
description: ai-jail runs coding agents behind bubblewrap, Landlock and seccomp. building it taught me how many ways permissions can lie.
img: /images/ai-jail-sandbox/cover.png
---

I run AI coding agents on my machine. They execute shell commands. That means I effectively invite a program to type into my terminal all day. `ai-jail` is my attempt to make that invitation bounded: on Linux it wraps the agent in bubblewrap, Landlock, seccomp and resource limits; on macOS, `sandbox-exec`.

The README says it plainly: **a useful layer, not a replacement for a disposable VM when running hostile code.** That sentence came from the build, not from theory.

## containers are for services; agents are for your filesystem

A container gives isolation, but an agent that edits *my project* needs my project. Mounting the workspace is the point. So the design is a carefully scoped filesystem view plus filters:

- read-only for most of the system,
- read-write only for the workspace and designated caches,
- no access to SSH keys, cloud credentials, or the Docker socket,
- syscall filtering so a compromised process can't casually escape the intended surface.

Every one of those is a default I had to *choose*. Each permissive mount is a decision with a blast radius.

## the paranoid details are the product

One example among many: the binary path that gets executed inside the sandbox (`BWRAP_BIN`) is validated. It must resolve to a root-owned executable that isn't group- or world-writable. Why? Because if an agent can write to the binary you invoke, the sandbox is decoration.

That's the recurring lesson: **permission checks have to consider who can change the thing, not just what the thing is.**

## failure modes matter more than features

A sandbox that fails open is worse than no sandbox, because it creates trust. So:

- if `bwrap` is missing, don't silently run unsandboxed — refuse or warn loudly,
- if a requested mount would expose credentials, fail the launch,
- keep the policy in text so it can be audited.

## what I took from this

- Isolation is a spectrum. A container, a VM, and `seccomp` are different tools with different promises.
- The attack surface includes everything the agent can *write to*, not only what it can read.
- Security defaults should be explicit and boring, and the escape hatches should be deliberate.
- Documentation is part of the mechanism: telling users what this is *not* protects them.

I still think running an agent is a trust decision. ai-jail makes the decision smaller, not invisible.
