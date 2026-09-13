---
title: the nginx reload that failed silently
date: 2026-04-14
description: systemctl reload said success, the site kept serving the old config, and nginx -t was happy. one line in the error log explained everything.
img: /images/nginx-silent-reload/cover.jpg
---

You can find the code at: [github.com/luis-ota/luis-ota-portfolio](https://github.com/luis-ota/luis-ota-portfolio).

logbook: the reload that lied

![Data storm](inline.jpg)

kept verbatim, timestamps approximate.

---

**14:02** changed the nginx root for wired.rs and ran the usual:

```
$ sudo nginx -t && sudo systemctl reload nginx
nginx: configuration file /etc/nginx/nginx.conf test is successful
# exit 0
```

green across the board. moved on.

**14:40** the site is still serving from the old directory. `curl` the page, check the marker I just changed. old marker.

**14:44** assume browser cache. hard refresh. same. `curl` from a different machine. same.

**14:48** check the config that nginx *claims* to have loaded:

```
$ sudo nginx -T | grep -A2 "server_name wired.rs"
root /home/ubuntu/wired-rs;
```

the running config says the new root. the responses say the old one. two truths.

**14:53** check the workers:

```
$ ps -o pid,lstart,cmd -p <worker_pids>
nginx: worker process   Mon Aug 24 15:48:34 2026
```

workers from weeks ago. my reload, six minutes old, produced **no new workers**. so nginx never applied anything. the `-t` test passed because it validates a *fresh parse*; it has no idea what is currently in memory.

**15:01** the error log:

```
[emerg] limit_req "wired_auth" uses the "$binary_remote_addr" key
while previously it used the "$http_cf_connecting_ip" key
```

there it is. another site's config changed the key of a `limit_req_zone` that already existed in shared memory. nginx cannot redefine a zone's key at runtime. the reload aborted; the master kept the old config and the old workers; the signal had been delivered successfully, so systemd reported success.

**15:04** restart:

```
$ sudo systemctl restart nginx
```

new workers, new shared memory, new config. the pollar went through.

**15:06** verify from outside: `curl` returns the new marker. finally.

---

**post-notes**

- reload exit 0 means "SIGHUP delivered". it is not an apply.
- `nginx -t` validates a world that may never run. it cannot see runtime state.
- worker start times are the ground truth for "did the config apply".
- shared memory zones are stateful; changing how one is defined is a restart, not a reload.
- after every deploy, curl a marker. the only reliable reporter is the outside.

next time a config change "does nothing", i check three things in order: error log, worker PIDs, outside behavior. the config file is the least trustworthy of the four.

## image credits

- cover: [Ethernet Patch Panel - Rear](https://www.flickr.com/photos/84816487@N00/2261404199) by dmitrybarsky (by 2.0)
- image: [Racks line](https://www.flickr.com/photos/58411470@N00/8475764430) by kewl (by 2.0)
