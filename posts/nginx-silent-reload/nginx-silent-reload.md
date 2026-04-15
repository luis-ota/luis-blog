---
title: the nginx reload that failed silently
date: 2026-04-14
description: systemctl reload said success, the site kept serving the old config, and nginx -t was happy. one line in the error log explained everything.
img: /images/nginx-silent-reload/cover.png
---

I changed an nginx config, ran the usual dance, and saw this:

```bash
$ sudo nginx -t && sudo systemctl reload nginx
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
# reload exits 0
```

Success. Except nothing changed. The site kept serving the old root directory, old proxy target, old everything. For days.

## reload is not apply

`systemctl reload nginx` sends `SIGHUP`. The master process re-reads the configuration and asks workers to gracefully shut down while new workers take over. If the re-read fails, the master keeps the **old configuration and the old workers**, and the reload command still returns success, because sending a signal succeeded.

The actual failure was in the error log, which nobody reads when the command is green:

```text
[emerg] limit_req "wired_auth" uses the "$binary_remote_addr" key
while previously it used the "$http_cf_connecting_ip" key
```

A `limit_req_zone` in another site's config had changed its key. nginx cannot change the key of an existing shared memory zone at reload time — the zone already exists in memory. So the whole reload was rejected. `nginx -t` passed because it parses the new config in a **fresh** process, where the old zone definition doesn't exist. The test was validating a world that would never be born.

## how I noticed

The smoking gun wasn't the config test; it was process state:

```bash
$ ps -o pid,lstart,cmd -p <worker_pids>
# workers started weeks ago, long before my reload
```

New config means new workers. Old worker start times mean no reload happened.

## the fix

A restart discards the old shared memory zones and applies everything:

```bash
sudo systemctl restart nginx
```

It's a brief blip for all sites on that box (single-digit milliseconds for a busy server like this, honestly), and it's honest: it either works or it fails loudly.

A better long-term fix is not changing a zone key in place. But when you inherit configs you didn't write, you want the restart in your toolbox.

## what I took from this

- `reload` returning 0 means "signal delivered", not "config applied". Check the error log and worker start times.
- `nginx -t` tests a fresh parse; it cannot see runtime constraints like existing zones.
- After any deploy, verify behavior from the outside: `curl` and check a marker. "No output" is not "no change".
- Shared memory zones are stateful. Stateful things don't reload cleanly, and the error lives in the log, not in the exit code.

Now every config change I make ends with a `curl` against the real domain, because I no longer trust green text.
