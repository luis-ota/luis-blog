---
title: what your SSL grade actually means, from A+ to T
date: 2026-10-08
description: "paste a domain into ssllabs, get a letter back. the letter is a configuration score, not a shopping decision. here is what each grade maps to, what lives inside the certificate, why an incomplete chain caps you at B, and what an expensive certificate really buys."
img: /images/ssl-grade-of-your-site/cover.jpg
---

the letter is a config score.

![locked fence](inline.jpg)

a field guide to [qualys ssl labs](https://www.ssllabs.com/ssltest/), from A+ down to the two letters that are not grades at all.

---

## what the test is really doing

you paste a hostname. from one vantage point (their data center, not your laptop), ssl labs opens hundreds of handshakes against you: every protocol version it knows, every cipher suite it can find, using simulated clients that impersonate old browsers, old androids and old openssl builds.

that last part is the one people miss. the scan does not answer "what does my browser do". it answers "what could *anything* still negotiate with this server". the grade is the worst case, not the typical case.

three categories get scored, with the weights from the official [rating guide](https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide):

- protocol support, 30%
- key exchange, 30%
- cipher strength, 40%

each one is turned into a percentage, combined, mapped to a letter, and then a pile of caps and exceptions is applied on top. the result is a snapshot: the same host can be A+ on tuesday and B on thursday after somebody deploys an old file.

---

## every grade, one by one

**A+** is a configuration, not a purchase. modern protocols only, no warnings at all, and HSTS with a `max-age` of at least six months. since the March 2025 grading change, missing TLS 1.3 caps you at A-, and missing or invalid HSTS drops you to A- as well. so on today's grading, TLS 1.3 plus HSTS is the price of admission to the top letter.

**A** is the same thing with nothing capping you, or with HSTS missing on older reports. Qualys support has said for years that both A and B are "adequate commercial security".

**A-** is a good config carrying at least one warning. it is the grade you get from "modern everything, no TLS 1.3 yet" or "modern everything, no HSTS".

**B** means a cap was applied. the usual reasons, straight from the changelog of the rating guide:

- TLS 1.0 or 1.1 still accepted
- SSL 3.0 accepted
- **chain of trust incomplete**
- no forward secrecy
- no AEAD ciphers offered
- RC4 still offered
- RSA key under 2048 bits, or DH parameters under 2048

**C** is roughly: no TLS 1.2, RC4 negotiated with TLS 1.1+, 3DES (64-bit block ciphers) with TLS 1.1+, or a CRIME/POODLE-style compression problem.

**D and E** exist in the letter table (35+ and 20+) but in practice you only meet them on old appliances. since 2014, a server whose *best* protocol is SSL 3.0 is failed outright instead of graded.

**F** is a score collapse. export-grade suites, DH parameters under 1024 bits, keys under 1024 bits, MD5 or MD2 signatures, RSA exponent 1, and specific famous vulnerabilities: Heartbleed, ROBOT, DROWN.

**M** is a name mismatch. the certificate is fine, the hostname is not in it. a typo, not an attack.

**T** is "not trusted": expired, not yet valid, self-signed, unknown CA, revoked. the guide is explicit that trust problems get their own letter because without trust the security grade is meaningless. anyone can MITM a connection to a server whose certificate nobody can verify.

and one more thing the UI no longer shows: the numeric score behind the letter. it has been hidden since 2013. the translation table is `80+ A`, `65+ B`, `50+ C`, `35+ D`, `20+ E`, below that `F`.

---

## what a B actually means for users

honest answer: usually nothing. which is exactly why people ignore the badge.

B is a bucket, not a diagnosis. "TLS 1.0 is still on" and "your chain is missing the intermediate" produce the same letter, and only one of them deserves an incident ticket. so read the *cap*, not the letter:

- **TLS 1.0/1.1 still enabled.** cosmetic for a normal site. nothing in current browsers or phones supports them, and turning them off is free.
- **no forward secrecy (static RSA).** real but modest. a private key leaked today does not decrypt traffic captured yesterday with PFS. it is a downgrade grade, not a breach.
- **incomplete chain.** the only one in this list that breaks users in production. section below.
- **RSA 1024.** real. below what anybody accepts now, and one directive away from being fixed.
- **RC4 offered.** a broken cipher. delete it.

and remember B is a *cap*: the letter stops there. it does not tell you how far below it you scored. read the individual items, or you are reading a rounded number.

---

## inside the certificate

run this on your own box before you read anyone's summary:

```
openssl x509 -in fullchain.pem -noout -text
```

what comes back, field by field, for a normal let's encrypt leaf:

```
Version: 3
Serial Number: 03:1a:9f:...
Signature Algorithm: sha256WithRSAEncryption
Issuer: C = US, O = Let's Encrypt, CN = R11
Validity
    Not Before: Sep 30 12:00:00 2026 GMT
    Not After : Dec 29 12:00:00 2026 GMT
Subject: CN = wired.rs
Subject Alternative Name: DNS:wired.rs, DNS:www.wired.rs
...
X509v3 extensions:
    X509v3 Basic Constraints: critical
        CA:FALSE
    X509v3 Key Usage: critical
        Digital Signature, Key Encipherment
    X509v3 Extended Key Usage:
        TLS Web Server Authentication
    X509v3 Subject Key Identifier: ...
    X509v3 Authority Key Identifier: keyid:...
    X509v3 Authority Information Access:
        OCSP - URI:http://r11.o.lencr.org/
        caIssuers - URI:http://r11.c.lencr.org/
    X509v3 Certificate Transparency:
        CT Precertificate SCTs: ...
```

the fields that decide whether your users get a padlock:

- **SAN** is the only thing browsers check. CN has been ignored since Chrome 58 (2017). every name a user can type has to be in that list, `www` and apex included. miss it and you get the `M` grade plus a full-screen warning.
- **wildcards.** `*.wired.rs` matches exactly one label. not `wired.rs`, not `a.b.wired.rs`. for apex plus wildcard you need both names in the SAN, or two certificates selected by SNI.
- **key usage and EKU.** a web server needs `Digital Signature` and `TLS Web Server Authentication`. `CA:FALSE` is what stops your leaf from being used to sign other certificates.
- **issuer** is not a claim about you, it is who vouched for you. the chain is leaf, intermediate, root, and the root is supposed to already be in the client's trust store.
- **validity.** 90 days on let's encrypt, one year on most paid certificates. an expired one is a `T` grade and a browser interstitial that costs real conversions.
- **AIA** points at the OCSP responder and the CA's issuer URL. it is what lets a client recover a missing intermediate in a pinch, and it is also what makes the "it works on my machine" failure mode possible at all.
- **SCTs** are certificate transparency timestamps from Google's, Apple's and Mozilla's logs. free misissuance detection: a CA that issues a certificate for your domain without logging it becomes visible to the world. one of the better parts of the whole system.
- **signature algorithm and key size.** `sha256WithRSAEncryption` with RSA 2048 is the baseline; 4096 costs CPU on every handshake for no measurable gain, and EC P-256 is the lighter option when you control both ends. keys under 1024 bits are an instant F.

the key strength, separately:

```
openssl x509 -in cert.pem -noout -pubkey | openssl pkey -pubin -text | head -1
```

---

## the incomplete chain, in nginx

this is the one i see most, and it is beautiful because it fails *intermittently*.

the setup is one word. you copied `cert.pem` instead of `fullchain.pem`:

```
ssl_certificate     /etc/letsencrypt/live/wired.rs/cert.pem;   # leaf only
```

your server now sends a single certificate and expects every client to fetch the intermediate by itself, from the AIA `caIssuers` URL. sometimes that works. on your laptop it works, because let's encrypt's R11 intermediate has been sitting in every browser's cache since it shipped in 2024, borrowed from some other site.

then the support ticket arrives:

```
unable to get local issuer certificate
```

android is the classic victim: no warm cache, no AIA fetching, strict chain building. same story with `curl` on a clean machine, some java clients, and a fresh firefox profile. the desktop is fine and the phone is broken, on the same day, with the same certificate.

ssl labs says it out loud: **certificate chain incomplete**, grade **capped to B**. not because you are weak, because you are unreliable.

the fix is one word:

```
ssl_certificate     /etc/letsencrypt/live/wired.rs/fullchain.pem;
```

`fullchain.pem` is the leaf plus the intermediates, and it deliberately does **not** include the root. the root is supposed to be in the client's trust store, and shipping it wastes bytes.

if you assemble the chain yourself, nginx takes a list:

```
ssl_certificate     wired.rs.pem  wired.rs-chain.pem;
```

verify it locally before reloading, because this bug is invisible from the machine that made the mistake:

```
$ openssl s_client -connect wired.rs:443 -servername wired.rs -showcerts </dev/null 2>/dev/null \
    | grep -E "^ *[0-9]+ [si]:"
 0 s:CN = wired.rs
   i:C = US, O = Let's Encrypt, CN = R11
```

one certificate where you expected two is an incomplete chain. the strict version, with files on disk:

```
$ openssl verify -untrusted chain.pem -CAfile roots.pem cert.pem
cert.pem: OK
```

nginx will start happily with a broken chain and log nothing. from its point of view nothing is wrong, which is the whole problem.

### stapling depends on this too

ocsp stapling is the server fetching the revocation answer once and handing it to every client, so nobody has to talk to the CA. it only works with the full chain: stapling the leaf alone produces a response the client cannot validate.

```
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/wired.rs/chain.pem;
resolver 1.1.1.1 8.8.8.8 valid=300s;
resolver_timeout 5s;
```

the `resolver` lines are not optional decoration: nginx refuses to start with stapling enabled and no resolver.

---

## the failures you will not see

the reason this bug outlives most deployments is simple: the only machines that can reproduce it are not yours. here is the list of things it does quietly.

**your browser is lying to you.** the intermediate is already in your OS trust store, cached from some other site that used the same CA. desktop chrome, the laptop you develop on, and most CI agents all say *fine*. the chain is only "incomplete" for clients that do not have a warm cache, which is precisely the population you do not sit next to.

**android never fetches the AIA.** that is a deliberate design decision in android's chain builder, not an oversight: it will not go to the network to complete a chain. so a site that opens on every laptop in the office fails on every phone. "works on my machine" with a much longer arm.

**some clients fail harder than others.** safari shows a page the user can click through. an app with ATS enabled gets `error -1022` and no dialog at all. a python client gets `CERTIFICATE_VERIFY_FAILED`, a go client gets `x509: certificate signed by unknown authority`. those never present as "certificate warning" to a human. they present as "the api is down" in a channel nobody reads.

**the AIA fetch is a network dependency you do not control.** completing the chain means an extra HTTP request to the CA (`http://r11.c.lencr.org`, plain HTTP port 80, straight from the `caIssuers` URI). corporate egress proxies, dns filters and some networks block it. the symptom is that the site breaks only from inside one office, only on the network that blocks the CA, and works perfectly from home. you will never reproduce it from your desk, and your support channel will not tell you which network it came from.

**one extra round trip on every handshake.** the client either waits on the CA or fails. on a phone link that is a visible latency cost, per connection, on top of every request.

**hsts turns a warning into a wall.** this is the one that bites after you did everything right. with `Strict-Transport-Security` the browser stops offering the "advanced / proceed anyway" interstitial, because the whole point of HSTS is to remove the user's ability to ignore the certificate. `includeSubDomains` extends the wall to every other hostname you serve. a clickable warning on the desktop becomes a hard failure for the user you were trying to protect, and you got the A+ that caused it.

**renewal is healthy, deployment is not.** certbot rewrites the files in `live/` every 60 days and reports success. if your image build copies only `cert.pem`, or your deploy hook reloads nginx from a path that still holds the old single file, the broken chain survives every renewal untouched. the certificate is always fresh and always incomplete, and nothing in the renewal log ever mentions it. this one can hide for years.

**your monitoring lives inside the same trust boundary.** a health check from a container with baked-in roots, from the same cloud provider's network, or through the CDN that terminates on the other side, all have warm caches. "origin healthy" says nothing about the chain a stranger sees.

**the trust path can expire under you.** the missing intermediate is usually compensated by a cross-signed path: intermediate X signed by an old root, cross-certified by the new one. clients holding the old root in their store keep connecting; clients on a fresh store take the other path. when a root or an intermediate is retired, the compensating path disappears and every incomplete chain breaks in the same week. DST Root CA on 30 Sep 2021 is the canonical example. your chain was never correct, you were borrowing time.

to simulate a cold client, throw away the warm cache:

```
$ openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt cert.pem
cert.pem: unable to get local issuer certificate
```

that is the exact error a phone gives you, from a machine that has never seen the intermediate. now give `openssl` the chain:

```
$ cat cert.pem chain.pem > /tmp/bundle.pem
$ openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt /tmp/bundle.pem
/tmp/bundle.pem: OK
```

every item in that list is fixed by the same single word: `fullchain.pem`.

---

## a config that actually gets A+

mozilla's "intermediate" profile, trimmed to what nginx supports:

```
server {
  listen 443 ssl;
  http2 on;                      # nginx 1.25.1+; older builds want "listen 443 ssl http2"
  server_name wired.rs;

  ssl_certificate     /etc/letsencrypt/live/wired.rs/fullchain.pem;
  ssl_private_key     /etc/letsencrypt/live/wired.rs/privkey.pem;

  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;
  ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_session_timeout 1d;
  ssl_session_cache   shared:MozSSL:10m;
  ssl_session_tickets off;
  ssl_ecdh_curve      X25519:prime256v1;

  ssl_stapling on;
  ssl_stapling_verify on;
  ssl_trusted_certificate /etc/letsencrypt/live/wired.rs/chain.pem;

  add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;
}
```

redirect port 80 to 443 as well, or HSTS is the only thing standing between your users and a downgrade.

```
$ nginx -t && systemctl reload nginx
```

going from B to A+ is usually four changes: `fullchain.pem`, dropping TLS 1.0/1.1, sending HSTS, and enabling TLS 1.3 if the build was old. none of them cost money.

---

## free versus the expensive one

the short version: **the price of the certificate appears nowhere in the grade.**

|                      | DV free          | OV        | EV                            |
| -------------------- | ---------------- | --------- | ----------------------------- |
| what the CA checks   | domain control   | + company records | + extended vetting   |
| typical price        | $0               | $50-200/yr | $150-500/yr, wildcard ~$1k+   |
| validity             | 90 days          | 1 year    | 1 year                        |
| key strength         | 2048 or EC       | 2048 or EC | 2048 or EC                    |
| ciphers, 1.3, PFS, HSTS | **your config** | same      | same                          |
| what the user sees   | padlock          | padlock   | padlock                       |

what the money actually buys:

- **human vetting that your company exists.** real value, but it is anti-fraud, not anti-cracking. it does not make a session harder to break.
- **a longer validity.** 90 days means automation or an outage. this is the entire real cost of a free certificate, and it is an ops problem, not a security one.
- **wildcards, back when free CAs would not issue them.** let's encrypt has done DNS-01 wildcards since 2018, so this argument is over.
- **a warranty.** the famous "$1M identity theft protection" is mostly a business liability policy wrapped in marketing. read what it covers before you count it as security.
- **an invoice**, for the compliance checklist that literally says "extended validation".

what it does not buy:

- stronger ciphers, forward secrecy, TLS 1.3, HSTS, stapling, a shorter chain. all of them are lines in a config file, free.
- **a better grade.** a $900 EV served with TLS 1.0 and a broken chain is a B. a $0 let's encrypt certificate with the config above is an A+.
- **a fancier padlock.** browsers removed the extended-validation UI years ago (Chrome 77, 2019). there is nothing on screen that distinguishes an EV from a DV. the padlock says "encrypted", not "trustworthy company".

and the reverse trap: the "premium SSL" upsell on hosting panels is usually the same DV certificate you can get for free, relabeled. ask three questions before paying: which CA, how long is the validity, and does that price include the renewal or only the first year.

the honest summary: **take the free certificate, automate the renewal, and spend the money on the server config or on something that actually reduces risk.** pay only when a contract or a regulator names it.

---

## checklist

- run the ssllabs scan before and after every TLS change, not once a year
- serve `fullchain.pem`, never `cert.pem`
- `ssl_protocols TLSv1.2 TLSv1.3;` and nothing older
- HSTS with a real max-age, plus a 301 from port 80
- alert on expiry from *outside* your network. the CA emails you, and that email is not monitoring
- when a client complains, test with a cold cache and `curl --cacert` before you blame the certificate
- ship certificates only after testing them with a cold trust store (`openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt`). a warm browser proves nothing
- remember the grade is one vantage point on one day, scoring the worst client instead of yours

---

the letter is the cheapest part of TLS. a certificate is a public, signed statement about a domain name that anyone can read, and its authority comes from the chain above it, not from the price of the paper. A+ just means your configuration is boring in all the right ways.

*references: [SSL Server Rating Guide](https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide), [qualys grading changes, march 2025](https://notifications.qualys.com/product/2025/02/26/key-changes-in-ssl-labs-grading-and-qualys-certview), [mozilla server side tls](https://wiki.mozilla.org/Security/Server_Side_TLS).*

## image credits

- cover: [Security](https://www.flickr.com/photos/15923063@N00/2294144289) by CarbonNYC [in SF!] (by 2.0)
- image: [locked fence](https://www.flickr.com/photos/27574438@N00/22167426) by Hay Kranen (by 2.0)
