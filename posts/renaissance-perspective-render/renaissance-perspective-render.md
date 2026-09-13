---
title: Renaissance perspective was the first render engine
date: 2026-01-06
description: Brunelleschi painted a building, held up a mirror, and invented the camera transform. we just moved the math to a GPU.
img: /images/renaissance-perspective-render/cover.jpg
---

lecture notes: the first render engine was a painting

![Florence cathedral dome interior](inline.jpg)

topic: linear perspective as a projection pipeline. no prerequisites except curiosity.

---

## the experiment

florence, around 1413. filippo brunelleschi paints the baptistery on a panel, drills a peephole, and holds a mirror in front of it. the viewer looks through the hole at the painting reflected in the mirror. if the geometry is right, the painting and the real building line up exactly.

they did.

what brunelleschi demonstrated is that a 3d scene can be mapped onto a 2d surface by a rule. that rule is a projection, and the painting was the first render.

## the pipeline, spelled out

a modern renderer does four things. so did the panel.

1. **place a camera.** a position and an orientation. brunelleschi's peephole.
2. **define the image plane.** a rectangle where the world gets flattened. the panel.
3. **project along lines of sight.** straight lines from the eye through the scene onto the plane. this is where math enters.
4. **decide what the viewer sees where lines cross.** paint, or pixels.

*sidenote:*

> in matrix terms, step 3 is a multiplication. the camera transform moves the world so the camera sits at the origin; the projection matrix divides by depth. the "divide by z" is why distant things get smaller. a renaissance painter executed the same division by drawing the vanishing point and running threads to it.

## why the vanishing point mattered

parallel lines, in reality, do not meet. on the image plane they do, at a point determined by the camera's direction. painters noticed immediately that this constrains everything: you can no longer place a figure wherever you like. the space has laws, and the painting obeys them or fails to convince.

that is the relationship between a projection and a scene today, exactly. a wrong camera matrix does not produce an "invalid render". it produces an image that lies about space, and the eye catches it.

## the camera obscura years

later, painters used a dark room with a lens to project reality directly onto canvas. they added lenses, apertures, mirrors. read that as a pipeline: input, optics, exposure, output. their render settings were physical; ours are numbers. the decisions are the same ones: framing, focus, light.

## assignment

look at a painting made after 1420 and find the vanishing point. then open any 3d game and find the frustum. same idea, six hundred years apart, and one of them runs at 144 frames per second.

## image credits

- cover: [Alsace, Haut-Rhin, Colmar, Musée d'UnterLinden : Lucas Cranach l'Ancien ' La Mélancolie ',](https://www.flickr.com/photos/44613506@N07/4841298905) by (vincent desjardins) (by 2.0)
- image: [Florence cathedral dome interior](https://www.flickr.com/photos/18964106@N00/8731865709) by tpholland (by 2.0)
