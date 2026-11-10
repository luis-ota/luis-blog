---
title: rebuilding a dead r36s from the pieces of its own card
date: 2026-11-10
description: a handheld that booted and then lost its own directories, cards that lied about how much they could hold, and a board that is not the one on the label
img: /images/r36s-restoration/cover.jpg
---

You can find the code and the notes at: [github.com/luis-ota/r36s-restauracao](https://github.com/luis-ota/r36s-restauracao).

Listen to `bôa - Duvet` while reading!

<iframe style="border-radius:12px" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/boa76436/duvet&color=%23a3242c&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false"></iframe>

the console booted, showed the menu and played games. then one reboot took the directories away.

![the custom theme on the 640x480 screen, list of systems](menu.jpg)

a small linux handheld, a card that was already dead, and a label that did not match the board.

---

## the card that lied

the first symptom looked like software. the system came up, and after a reboot the ext4 root had lost whole directories: the tools menu, the home folder, the theme. `e2fsck` called the root clean and handed it back without them. a clean fsck means the metadata is consistent, not that your system is still there.

the games partition was worse. its boot sector had been overwritten with data from an unrelated file, so nothing mounted it anymore.

the card itself was the problem. it reported its full size on one connection and a few kilobytes on the next, which is a controller in emergency mode and not a filesystem bug. no amount of repair fixes that.

so before writing anything i tested cards properly: random data at spread offsets, read back with direct I/O, compare hashes. reading through the page cache measures your own memory, not the card. a big card failed across most of its advertised space and went to the bin. a small one passed every point.

capacity is a claim. the test is the evidence.

---

## what survived

the original card was still readable in places, so the first job was to copy the three regions that matter before writing anything:

```bash
sudo dd if=/dev/sdX of=head.img bs=1M count=16 status=progress
sudo sfdisk -d /dev/sdX > layout.txt
sudo dd if=/dev/sdX1 of=boot.img bs=1M status=progress
sudo dd if=/dev/sdX2 of=root.img bs=1M status=progress
```

that is the bootloader, the BOOT partition (kernel, dtb, `boot.ini`) and the root partition. with those three pieces the device boots again without downloading anybody else's image.

then i made it smaller. out went unused packages, apt and user caches, themes and ports. the kernel, the dtb and the services that keep the hardware alive stayed: pmic calibration, the battery daemon, brightness and volume at boot, the mali symlinks. an image that fits a small card is faster to copy and easier to verify.

---

## the black screen

the first attempts were other distributions. ROCKNIX and AmberELEC both booted and both gave a black screen. the device was alive, the network answered, the screen just stayed dark.

that is the dtb. every board revision drives a different panel, and a dtb for another panel configures a display that is not there. there is no error message, only black. the factory dtb, kept from the original BOOT partition, fixed it.

the boot chain is boring and that is the point: bootloader, kernel plus dtb, root. the dtb is the least interesting file in the partition and the one that decides whether you see anything at all.

---

## the label is not the board

with the console booting, i opened the back and read the pcb: `Y3506_V03_20241210`, from the board family the community calls soy sauce. the sticker says R36S. the firmware built for the original R36S does not cover this board.

that explains the black screens better than any driver theory. check it before flashing anything:

```bash
cat /sys/firmware/devicetree/base/model
tr '\0' '\n' < /sys/firmware/devicetree/base/compatible | head -3
```

`model` says Rockchip RK3326, which tells you nothing about the panel. the pcb tells you everything.

---

## a screenshot of a screen that has no screenshot

i wanted real screenshots for the notes on the theme i built. `/dev/fb0` returned 640x480 of white while the menu was clearly on the screen. emulationstation draws through DRM/KMS, and `/dev/fb0` is the console emulation, a different buffer entirely.

so the capture tool reads the framebuffer that is actually being scanned: open `/dev/dri/card0`, ask for the resources, get the active crtc, get its framebuffer, map the dumb buffer, read `pitch * height` bytes, convert XRGB8888 to png. ctypes only, nothing to install on the device.

![a ds game running on the console, captured from the framebuffer](ds.jpg)

both screenshots in this post came from that tool. the theme's background art is not mine, so it is blurred in the first one.

---

## two cards

the system now lives on a small card and the games on another, mounted at `/mnt/jogos`. saves survive a dead system card, and a dead games card no longer takes the system down with it. the theme moved too: it used to sit behind a symlink into the games partition and died with it.

the autosave service i wrote later, for a ds emulator that has none, ended up in the same repository. that story is its own post: [teaching a ds emulator to save itself](https://blog.wired.rs/posts/drastic-autosave-uinput).

---

## what i'd tell past me

a device that boots is not a device that survives a reboot. test the card with random data and direct reads before you trust it, keep an image of the working system with a checksum, and read the board before downloading firmware for the name on the sticker.

the console did not come back because i found the right image to flash. it came back because the original card still had enough readable pieces to rebuild it, and because i stopped assuming that the label was the hardware.

## image credits

- all images are my own photos and screenshots of the device. the theme background art is not mine, so it is blurred in the screenshot.
