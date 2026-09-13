---
title: never run the security scanner on the host
date: 2026-02-24
description: SmartSec runs Nmap and Nuclei inside rootless Podman containers, with pinned digests and minimized evidence. that constraint shaped the whole design.
img: /images/smartsec-podman-scanners/cover.jpg
---

seven rules for running hostile software

![Fibre to Cabinet, Basingstoke](inline.jpg)

smartsec is a security scanner. scanned targets send hostile responses. these are the rules the project runs on.

---

### rule 1: the scanner never runs on the host

nmap and nuclei are complex programs that parse untrusted input. running them as my user, on my machine, is a trust decision disguised as a convenience. every scan executes inside a rootless podman container instead. the application orchestrates; the container touches the network.

### rule 2: pin by digest, never by tag

a tag is a moving label. `nuclei:latest` is a different program next week. the catalog pins image digests, so the thing that ran in a test is the thing that runs in production, and an update is a deliberate commit, not a surprise.

### rule 3: mount templates read-only

nuclei templates are code that runs against a target. they are mounted read-only, from a controlled source. a compromised template cannot write back into the host or into the next scan.

### rule 4: evidence is minimized at collection, not redacted later

scanners happily dump http bodies, headers, query strings, tokens that appeared in a response. none of that reaches the report. the pipeline keeps template, matcher, endpoint, host, url and tags. everything else is dropped *before* it is written anywhere. a redaction pass can fail; a collector that never copies the bytes cannot.

### rule 5: one engine, three surfaces

the same core runs the interactive tui, the headless mode (`scan --target`), and the ai analysis step. three adapters, one pipeline. otherwise the ci path becomes a second implementation, and second implementations drift.

### rule 6: ai enriches, it does not decide

the analysis step runs on a local ollama by default (openai or nvidia nim optionally). it writes explanations and recommendations on top of findings that deterministic tools produced. if the model is wrong or unavailable, the scan is still valid.

### rule 7: say what does not work

the catalog ships nmap and nuclei today. everything else in the tcc spec is future work, and the readme says so in bold. a security tool that overstates its coverage is worse than a small one that is honest.

---

these are not general truths. they are the constraints this project needs, written down so future-me cannot "temporarily" cross them during a debug session. especially rule 1.

smartsec is still a prototype. the architecture question it forced, *where does untrusted work execute?*, is the one I now ask before enabling any tool that touches data I did not write.

## image credits

- cover: [Racks line](https://www.flickr.com/photos/58411470@N00/8475764430) by kewl (by 2.0)
- image: [Fibre to Cabinet, Basingstoke](https://www.flickr.com/photos/27406286@N05/4218894050) by Mike Cattell (by 2.0)
