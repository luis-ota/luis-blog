---
title: two Docker daemons on the same machine (rootless vs rootful)
date: 2025-12-09
description: docker ps showed nothing, the container was clearly running, and the port was bound. I was talking to a different daemon.
img: /images/two-docker-daemons/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

field guide: which docker daemon am I talking to?

![network](inline.jpg)

a checklist I wrote after losing an hour to the wrong socket.

---

## the symptom

`docker ps` showed my containers. `sudo docker ps` showed *different* containers. both commands were "right". one machine, two engines.

---

## minute zero: check the socket before anything else

```bash
echo "$DOCKER_HOST"
docker context show
ls -la /var/run/docker.sock "$XDG_RUNTIME_DIR/docker.sock" 2>/dev/null
```

if `DOCKER_HOST` is empty and you are not root, the CLI falls back to `/var/run/docker.sock`, which belongs to the **rootful** daemon. if it points to `/run/user/1000/docker.sock`, you are talking to **rootless**.

two sockets, two worlds. pick one and stay in it.

---

## minute five: read `ss`, not `docker ps`

```bash
sudo ss -tlnp | grep 3000
```

the answer was the detail that cracked it:

```
users:(("docker-proxy",pid=1446,...))
```

`docker-proxy` running as **root**. my rootless containers could never own that port, and the deploy script (running as `ubuntu`) kept failing to bind it. the error said "port already allocated", which sounds like a race and is actually a different engine holding the lease.

---

## the two engines, side by side

| | rootful | rootless |
|---|---|---|
| daemon runs as | root | your user |
| socket | `/var/run/docker.sock` | `$XDG_RUNTIME_DIR/docker.sock` |
| container processes | root on the host | your user, in a user namespace |
| networking helper | `docker-proxy` as root | `rootlesskit` + `slirp4netns` |
| managed by | `systemctl status docker` | a user service or `dockerd-rootless.sh` |
| sees the other's containers | no | no |

`docker ps` is not "the list of containers on this machine". it is "the list of containers **this daemon** knows about". those are different sentences.

---

## the rules I follow now

1. one daemon per host, unless there is a reason.
2. deploy scripts always run as the same user, with the same context, as the containers they manage.
3. when a port bind fails, check *who owns the port* before touching the config.
4. never debug across the privilege boundary. `sudo docker` and `docker` are separate machines with a shared kernel.
5. if both engines must exist, split their port ranges on purpose.

---

## why rootless is still worth it

no root daemon means a container escape lands as my user, not as root. the price is exactly what bit me: an extra namespace between you and your ports, and a second universe to keep in your head.

the trick is not choosing the better daemon. it is knowing which one answers when you type.

## image credits

- cover: [Datacenter Work](https://www.flickr.com/photos/29479498@N05/4381851322) by Leonardo Rizzi (by-sa 2.0)
- image: [network](https://www.flickr.com/photos/30713600@N00/4333178624) by twicepix (by-sa 2.0)
