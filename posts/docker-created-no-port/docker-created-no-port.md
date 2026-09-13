---
title: the Docker container that was Created but never bound its port
date: 2025-11-16
description: the container was healthy, the app was listening inside, and 127.0.0.1:3000 was empty. docker teaches a lesson about when port bindings are programmed.
img: /images/docker-created-no-port/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

the container was healthy. the door was locked.

![Containers](inline.jpg)

a deploy story in four scenes.

---

**scene one: the port was taken**

a preview container was holding `127.0.0.1:3000` while I tested a new site. the deploy ran and failed the way you expect:

```
Bind for 127.0.0.1:3000 failed: port is already allocated
```

I removed the preview container, freeing the port, and re-ran the deploy. I expected a boring success.

---

**scene two: the container that existed**

`docker ps` answered immediately, cheerful:

```
luis-ota-portfolio   Up 2 minutes (healthy)
```

health means the process inside is answering a probe. the app had logged `listening on 3000`. every signal said "alive".

so I knocked:

```
$ curl http://127.0.0.1:3000/
curl: (7) Failed to connect
```

nothing. nobody home. I restarted the container. same. I checked the logs again, as if the logs would confess.

---

**scene three: the missing listener**

`docker port` printed an empty line. not a wrong port. nothing.

```
$ docker port luis-ota-portfolio
(empty)

$ sudo ss -tlnp | grep 3000
(empty)
```

but the config believed otherwise:

```
$ docker inspect luis-ota-portfolio --format '{{json .HostConfig.PortBindings}}'
{"3000/tcp":[{"HostIp":"127.0.0.1","HostPort":"3000"}]}
```

the mapping existed on paper. the kernel had never heard of it.

**the reveal:** docker programs port forwarding at *creation* time. my first failed `up` had created the container and then failed at the networking step. the container survived in `Created` state. the second `up` reused it: it started the process, but the creation step, where the port is wired, was never replayed.

healthy inside, invisible outside. a locked door with a green light above it.

---

**scene four: force-recreate**

```
docker compose up -d --force-recreate --remove-orphans
```

a fresh container, created from scratch, port programmed, `curl` returns 200.

that line now lives in every deploy script I own. it costs seconds and removes a whole category of ghost states: containers that are *almost* the container they claim to be.

---

**epilogue: the smoke test is the story**

the deploy script checks the app from the *outside*, through the proxy, after the container is up. if I had trusted `docker ps`, the site would have been "deployed" for an hour before anyone noticed.

automation lied to me exactly once, and the only reason it was cheap is that a `curl` disagreed with it.

## image credits

- cover: [Ym People at Keelung](https://www.flickr.com/photos/35626429@N08/3539418255) by wirralwater (by 2.0)
- image: [Containers](https://www.flickr.com/photos/35425743@N00/281385801) by Jim Bahn (by 2.0)
