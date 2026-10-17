# Asset brief · round 2 (17 Oct 2026)

What would lift the site most that code alone cannot, in priority order.
Everything here belongs to the same world as the renders you already have
(`docs/avatar-prompts.md`): same STYLE block, same CHARACTER block, same
chroma-green background so `scripts/cutout.mjs` can cut it out. Attach your
character sheet (`public/_raw/sheet-maria.png`) to every Maria prompt, as before.

The site is already improved with the existing assets (ink bleed, split-flap
years, fly-through, chai steam, the envelope letter, the opening). Nothing
below blocks that work. Generate in this order; send me each file as you have
it and I will integrate it.

How to save:

- Figures and strips: PNG, largest size Gemini offers, into `public/_raw/`
  (strips into `public/_raw/scene/`) with the file name given. I cut them out
  with `node scripts/cutout.mjs <name>` (figures) or
  `node scripts/cutout.mjs --in public/_raw/scene --out public/scene` (strips).
- Generate 3–4 candidates and keep the one whose face and proportions match
  the sheet best. For strips, keep the one with the cleanest, flattest green.

The two blocks referred to below are copied word for word from
`docs/avatar-prompts.md`: **[Block 1 STYLE]** and **[Block 2 CHARACTER]**.

---

## Priority 1 · The closing: Maria at sunrise with her chai

**Section:** Closing. **Why:** the closing currently reuses the opening's
pose. A pose of its own, at sunrise, chai in hand, looking out over the city
rather than up, makes the last frame answer the first instead of repeating it:
she found what she was looking for here. **Use:** transparent figure on the
roof at dawn, right of the closing words; enters with a slow rise; blinks.

File: `pose-closing.png` · eyes-closed variant: `pose-closing-blink.png`

> Full-body three-quarter back view of Maria at age 19 standing on a flat Karachi rooftop at sunrise, turned slightly towards the viewer, looking out over the city with a calm, settled half smile. She holds a small glass cup of chai in both hands at chest height, a faint wisp of steam rising. Hair loose, moving slightly in a morning breeze. Her everyday outfit as in the attached outfit photo (`refs/outfit-everyday.webp`): the dusty-rose pink square-neck kurta with white scalloped lace trim, wide-leg white palazzo trousers, cream flat ballet shoes. Rim light is warm low golden sunrise from the right; soft fill from a pale peach sky. Nothing else in frame.
> [Block 2 CHARACTER]
> [Block 1 STYLE]

Blink variant: same prompt, "eyes gently closed, same head angle, same pose exactly".

---

## Priority 2 · London rooftops, a skyline strip for 2010

**Section:** London 2010. **Why:** Karachi has its own skyline under the
story; London has only snow on a grey sky. A strip of London terraces under
the snow says *London* at a glance, and gives the snowfall something to fall
on. **Use:** a wide transparent strip along the bottom of the 2010 section,
moving slower than the words (parallax), snow settling in front of it.

File: `public/_raw/scene/london-strip.png` · aspect about 4:1 (for example 3200×800)

> A wide panoramic strip of London rooftops seen from a slight height on a snowy winter afternoon: a long row of Victorian brick terraced houses with chimney pots, slate roofs dusted with fresh snow, a few lit sash windows glowing warm, and far behind them the soft silhouette of distant chimneys and a church spire. Cool grey-blue daylight, gentle haze in the distance, no people, no cars, no text, no logos. Only the buildings, filling the bottom two thirds of the frame; above the roofline the background is a flat solid chroma green #00B140 with nothing in it, so the sky can be cut out. Stylised 3D render in the same look as the character renders: soft matte materials, clean sculpted shapes, gentle lighting.

---

## Priority 3 · Three soft clouds for the fly-through

**Section:** 2017 → 2023 transition. **Why:** the clouds the plane flies
through are drawn in code as soft blurred circles. Real cloud shapes, flying
past at three depths, would make that moment feel like air instead of
bokeh. **Use:** three transparent cloud images, scaled up towards the camera
inside the fly-through.

Files: `public/_raw/scene/cloud-1.png`, `cloud-2.png`, `cloud-3.png` · square, 1600×1600

> A single soft, puffy cumulus cloud, isolated and centred, lit warmly from one side with a gentle lavender shadow side, soft wispy edges, no hard outline, nothing else in frame, on a flat solid chroma green #00B140 background. Stylised 3D render, soft and painterly, matte, no text.

(Generate three times; ask for "a long low cloud", "a tall billowing cloud", "a small loose wisp" so the three differ.)

---

## Priority 4 · An airfield at dusk, a horizon strip for 2023

**Section:** The plan changed (2023). **Why:** the pilot dream is told with
an abstract sky. A distant runway with its edge lights, and a small trainer
aircraft parked far off, gives the dream a place without inventing anything
about her own life: it is the place she wanted to go, not a photograph of
her there. **Use:** a low horizon strip behind her, under the falling paper
plane; it dims with everything else at the cut to black.

File: `public/_raw/scene/airfield-strip.png` · aspect about 4:1

> A wide, low panoramic strip of a distant airfield at dusk: a long runway receding towards the horizon with rows of small warm edge lights, a control tower silhouette far to one side, a single small propeller trainer aircraft parked very far away, flat dry land. Deep purple-violet dusk light, a faint warm glow along the horizon line, slight haze. No people, no text, no markings, no flags, no logos. The buildings and land fill only the bottom quarter of the frame; everything above the horizon is a flat solid chroma green #00B140 so the sky can be cut out. Stylised 3D render, soft matte materials, same look as the character renders.

---

## Priority 5 · London reaction: catching the snowflake

**Section:** London 2010. **Why:** a second London pose, the same toddler
with a snowflake landing on her mitten and a delighted face, would let the
character react when a visitor taps the falling snow (the figure swaps to this
pose for a moment). A small, meaningful reaction instead of an animated
sticker. **Use:** crossfades over `pose-london` for about a second after a
snowflake is tapped.

File: `pose-london-catch.png`

> Same scene, same framing and camera as `pose-london.png` (attach it): Maria at age 3 in the red puffer coat and grey beanie, holding her mittened hands together in front of her, a single snowflake resting on one mitten, looking down at it with a delighted open-mouthed smile, eyebrows raised. Exactly the same outfit, proportions and lighting as the attached image.
> [Block 2 CHARACTER] (age 3, as in the London prompt)
> [Block 1 STYLE]

---

## Priority 6 · Paper for the letter and the envelope

**Section:** A letter. **Why:** the paper and the envelope are flat CSS
colours. A real paper texture, with faint fibres and a soft deckled edge,
makes the letter feel held rather than displayed. **Use:** background images
for the letter card and the envelope faces (tiled or stretched; colour is
kept by the CSS).

Files: `public/_raw/scene/paper-letter.png` (portrait, 1200×1600) and `paper-envelope.png` (landscape, 1600×1000)

> A flat, top-down scan of a single sheet of warm off-white writing paper, very subtle natural fibres, faint soft creases, no writing, no lines, no shadow, evenly lit, filling the whole frame edge to edge. Photographic texture, high resolution.

(For the envelope: "a flat top-down scan of a cream kraft envelope paper texture, very subtle fibres, no folds, no writing, filling the whole frame.")

---

Not recommended, and why: animated frame sequences of Maria (walk cycles,
waving). Generated frames rarely stay consistent from one to the next, and a
flickering face would undercut the quality of everything else. The breathing,
the blinks and one reaction pose give her life without that risk.
