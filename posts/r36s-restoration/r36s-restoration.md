---
title: rebuilding a dead r36s, one lying card at a time
date: 2026-11-10
description: a boot that never finished, three cards that could not hold what they promised, and a board that is not the one on the label
img: /images/r36s-restoration/cover.jpg
---

You can find the code and the notes at: [github.com/luis-ota/r36s-restauracao](https://github.com/luis-ota/r36s-restauracao).

Listen to `bôa - Duvet` while reading!

<iframe style="border-radius:12px" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/boa76436/duvet&color=%23a3242c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false"></iframe>

it did not break in one day. it had years of tinkering on it, and then one morning it stopped halfway through the boot.

![the custom theme on the 640x480 screen, list of systems](menu.jpg)

a stuck loading screen, a notebook, a handful of cards, and a board that is not the one on the sticker.

---

## it stopped in the middle of the boot

for a couple of years this console was my test bench. i updated packages, added a swap file, changed settings, installed and removed things that were never meant to live on a handheld with one gigabyte of ram. the kind of maintenance that is fine until the day it is not.

then i left it in a drawer for a long time. when i turned it on again it did what it always did: booted, showed the arkos splash, and started the loading animation. and stayed there. same screen, no error, no console, no menu.

i spent sunday night restarting it, waiting longer, trying to get a shell. i gave up. monday morning i started over, but from the other end.

## before touching the console, read the card

the first decision was to stop trying to boot it. i took the microsd out and put it in the notebook, and the card turned out to be readable enough to copy from.

three regions matter on a card like this, and i copied all three before writing anything:

```bash
sudo dd if=/dev/sdX of=head.img bs=1M count=16 status=progress
sudo sfdisk -d /dev/sdX > layout.txt
sudo dd if=/dev/sdX1 of=boot.img bs=1M status=progress
sudo dd if=/dev/sdX2 of=root.img bs=1M status=progress
```

that is the bootloader, the BOOT partition with kernel, dtb and `boot.ini`, and the root partition. with those pieces the device boots again without downloading anyone else's image.

the root partition was the interesting one. it opened, and whole directories were gone: the tools menu, the home folder, the theme. `e2fsck` called it clean and handed it back exactly as empty as it found it. a clean fsck means the metadata is consistent, not that your system is still there.

## the 128 gb that was not

the first replacement was a 128 gb card i already had. it formatted, it mounted, it accepted files. it was also fake.

the tell is always the same. the card reports one size on one connection and a completely different one on the next. mine went from something plausible to a few kilobytes, which is a controller in emergency mode, not a filesystem bug.

so i stopped trusting capacity and started testing it: random data written at spread offsets, read back with direct I/O, hashes compared. reading through the page cache measures your own memory, not the card. past a certain point, every block came back wrong.

the card claimed 128 gb. something around 3.6 gb was real.

## the 16 gb that was already dead

before giving up on the idea of a bigger card, i tried a 16 gb one. it was dead before i touched it. no partition table survived, writes went nowhere, reads returned garbage.

two cards in a row that could not do their job. at that point the honest question was not which card was good, it was whether any card i had was.

## back to the fake one, with 3.6 gb

the 128 gb card was useless as 128 gb, but nobody was asking for 128 gb. the system image i needed could fit in a fraction of that.

so i used only the region the test had confirmed, made a partition inside it, and treated the card as what it really was: a small card with a dishonest label. it worked for writing and reading. it was never going to be reliable.

## the smallest system that boots

the plan was simple and unglamorous: get emulationstation to appear. nothing else.

out went unused packages, apt and user caches, themes, ports and everything that only existed because the system used to be a test bench. in stayed the kernel, the dtb, and the services that keep the hardware alive: the pmic calibration, the battery daemon, brightness and volume at boot, the mali symlinks.

then i wrote the bootloader, the BOOT partition and the root back onto the card, in the same layout as the original, and turned it on.

the menu appeared. for a few minutes i thought it was over.

## the reboot that erased it

it was not over. the next reboot brought the directories gone again, with the same clean fsck and the same silence. the image was fine. the card was not. a card that cannot hold what it writes will always look like a software bug, because the failure happens after your program has already returned success.

that was the moment to stop insisting. a card that lies about its size will also lie about a successful write.

## the 4 gb that finally worked

i had a small genuine card, 4 gb, and nothing else to lose. i wrote the same image. it booted, and it kept booting after every restart.

that is when the console became a console again. mario and pokemon went in, and both ran without drama. then i found a 2 gb card in a drawer and gave it a new job: the games.

two cards, two responsibilities. the system on one, the games on the other, mounted at `/mnt/jogos`. saves survive a dead system card, and a dead games card no longer takes the system down with it. the theme moved too, because it used to live behind a symlink into the games partition and died with it.

## the black screen detour

in the middle of the card mess i tried other systems, because at that point anything that booted was worth a shot. ROCKNIX and AmberELEC both came up and both showed a black screen. the device was alive, the network answered, the screen stayed dark.

that is the dtb. every board revision drives a different panel, and a dtb for another panel configures a display that is not there. there is no error message, only black. the factory dtb, kept from the original BOOT partition, is what fixed it.

the boot chain is boring and that is the point: bootloader, kernel plus dtb, root. the dtb is the least interesting file in the partition and the one that decides whether you see anything at all.

## the label is not the board

with the console booting again i opened the back and read the pcb: `Y3506_V03_20241210`, from the board family the community calls soy sauce. the sticker says R36S. the firmware built for the original R36S does not cover this board.

that explains the black screens better than any driver theory. check it before flashing anything:

```bash
cat /sys/firmware/devicetree/base/model
tr '\0' '\n' < /sys/firmware/devicetree/base/compatible | head -3
```

`model` says Rockchip RK3326, which tells you nothing about the panel. the pcb tells you everything.

## screenshots from a screen that has no screenshots

i wanted real screenshots for the notes on the theme i built. `/dev/fb0` returned 640x480 of white while the menu was clearly on the screen. emulationstation draws through DRM/KMS, and `/dev/fb0` is the console emulation, a different buffer entirely.

so the capture tool reads the framebuffer that is actually being scanned: open `/dev/dri/card0`, ask for the resources, get the active crtc, get its framebuffer, map the dumb buffer, read `pitch * height` bytes, convert XRGB8888 to png. ctypes only, nothing to install on the device.

![a ds game running on the console, captured from the framebuffer](ds.jpg)

both screenshots in this post came from that tool. the theme's background art is not mine, so it is blurred in the first one.

## what came after the rescue

the console stayed on, and the work moved from saving it to living with it. a daemon that dims the panel and shows a slideshow when nobody touches it. a theme built for a 640x480 screen. scripts for the second card, for screenshots, for maintenance.

and an autosave for a ds emulator that has none, which is its own post: [teaching a ds emulator to save itself](https://blog.wired.rs/posts/drastic-autosave-uinput).

## what i'd tell past me

a device that boots is not a device that survives a reboot. test the card with random data and direct reads before you trust it, keep an image of the working system with a checksum, and read the board before downloading firmware for the name on the sticker.

the console did not come back because i found the right image to flash. it came back because i stopped trusting the first card that seemed to work, and because i stopped assuming that the label was the hardware.

## image credits

- all images are my own photos and screenshots of the device. the theme background art is not mine, so it is blurred in the screenshot.
