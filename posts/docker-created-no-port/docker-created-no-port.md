---
title: the Docker container that was Created but never bound its port
date: 2025-11-16
description: the container was healthy, the app was listening inside, and 127.0.0.1:3000 was empty. docker teaches a lesson about when port bindings are programmed.
img: /images/docker-created-no-port/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

Deploys are boring until one of them half-fails. Mine did, in a way that took me an hour to believe.

![Containers](inline.jpg)

The sequence:

1. I had a preview container on `127.0.0.1:3000` while I tested a new site.
2. The CI deploy ran `docker compose up -d`. Docker created the new container, tried to bind the same port, and failed: `Bind for 127.0.0.1:3000 failed: port is already allocated`.
3. I removed the preview container to free the port, then re-ran the deploy.
4. Compose said the container was up, `docker ps` showed **Up (healthy)**, the app logged "listening on 3000"... and `curl 127.0.0.1:3000` failed to connect.

```text
$ docker ps
luis-ota-portfolio | Up 2 minutes (healthy) | 

$ docker port luis-ota-portfolio
(empty)

$ docker inspect luis-ota-portfolio --format '{{json .HostConfig.PortBindings}}'
{"3000/tcp":[{"HostIp":"127.0.0.1","HostPort":"3000"}]}
```

The binding existed in the config and was **not programmed**. No listener, no `docker-proxy`, nothing.

## why

Docker programs port forwarding when the container is **created**. That first failed `up` created the container and then failed at the networking step. The container stayed behind in `Created` state. When I removed the other container and started this one again, the port setup step was not re-run - Docker considered the networking setup part of creation.

The container was healthy because the health check runs *inside* it. Inside the container, the app really was listening. The host side was never wired.

## the fix, and the habit

`--force-recreate` throws the container away and creates a fresh one, which programs the port correctly:

```bash
docker compose up -d --force-recreate --remove-orphans
```

That line now lives in every deploy script I have. It costs a couple of seconds and it makes the deploy deterministic: each run produces a container that was created in a good state, not one that got partway through creation and then kept existing.

## what I took from this

- A container can be `Up (healthy)` and still be unreachable. When that happens, check `docker port` first.
- "It started" is not the same as "it's reachable". My smoke test (a curl through the proxy from the host) is what caught it, and that's why I never deploy without one.
- Partial failures leave state behind. Automation must assume the previous attempt left a landmine, and clean it up: `--force-recreate`, `--remove-orphans`.
- Docker's own reference says the port mapping is applied at creation. Now I believe it.

## image credits

- cover: [Ym People at Keelung](https://www.flickr.com/photos/35626429@N08/3539418255) by wirralwater (by 2.0)
- image: [Containers](https://www.flickr.com/photos/35425743@N00/281385801) by Jim Bahn (by 2.0)
