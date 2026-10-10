# Avatar prompt pack for Gemini

Version 2 · 10 October 2026 · all ADJUST lines filled in from our Q&A. Nothing left to edit; copy and paste.

How to use this pack:

1. Generate the **Character sheet** first. Try 3–4 times, pick the one that looks most like you, and save it. This image is your reference from now on.
2. For every scene prompt, attach the character sheet image to the Gemini message and paste the prompt. For the two school scenes, also attach the matching uniform photo; for the sheet, the hero and the letter, also attach the outfit photo `public/_raw/refs/outfit-everyday.webp` (dusty-rose square-neck kurta with white lace trim, white palazzo trousers, cream flats). Generate 3–4 candidates per scene and keep the one whose face and proportions match the sheet best.
3. Ask for the largest size Gemini offers. Save as PNG. Put everything in `public/_raw/` with the file names given. Put the two uniform photos in `public/_raw/refs/`.
4. The background must be a **flat solid chroma green (#00B140)** so I can cut it out cleanly. A soft shadow on the floor is fine.
5. Every prompt is built from the blocks below plus a scene paragraph. Paste the blocks exactly; consistency depends on repeating the same words every time.

---

## Block 1 · STYLE (in every prompt, never change it)

> STYLE: stylised 3D character render in the manner of a modern animated feature, soft matte skin and fabric materials, gentle subsurface scattering, clean sculpted shapes, slightly oversized eyes but realistic proportions (not chibi), elegant and warm, soft studio lighting with one coloured rim light, 85mm lens look, full body visible head to toe, centred, plain flat solid chroma green background #00B140, no text, no watermark, no extra characters unless stated.

## Block 2 · CHARACTER (in every Maria prompt)

> CHARACTER: Maria, a 19-year-old Pakistani woman from Karachi. Light warm brown skin with a wheatish tone. Oval face. Large dark brown almond-shaped eyes. Medium natural dark eyebrows. Soft nose with a rounded tip. No moles, marks or freckles. Long, thick, straight dark hair with soft layers, falling past the shoulders, worn loose unless the scene says otherwise. Slim build, average height. Default expression: a soft closed-mouth smile, warm and thoughtful. She never wears a head covering. She wears thin round glasses only when a scene says so.

When a scene gives a younger age, keep the same face identity with age-appropriate proportions and features.

## Block 3 · CITY SCHOOL UNIFORM (age 8 scene only; also attach your photo)

> CITY SCHOOL UNIFORM: a white knee-length kameez tunic with a maroon shirt collar, a maroon button placket with three small white buttons, three-quarter sleeves with small maroon button tabs at the cuffs, and a white patch pocket on the left chest carrying a small round embroidered school crest in blue and yellow (no readable text). Worn over plain white shalwar, with black school shoes and white socks. Hair in a single long plait over one shoulder.

## Block 4 · KARSAZ UNIFORM (age 16 scene only; also attach your photo)

> KARSAZ UNIFORM: a knee-length navy sleeveless V-neck pinafore tunic worn over a pale lilac long-sleeved collared shirt, with a small embroidered crest low on the left side of the tunic. Plain white shalwar, a white dupatta draped over both shoulders, black school shoes and white socks. Hair in a single long plait over one shoulder.

## Block 5 · GINGER (in every cat prompt)

> GINGER: a real cat with solid warm orange fur and no visible stripes, a medium-length slightly fluffy coat with a soft chest and tail, amber-gold eyes, a lean alert build and a playful posture.

---

## 0 · Character sheet (generate first)

File: `sheet-maria.png`

> Character turnaround sheet for a 3D animated character. Show the same character three times side by side on one canvas: front view, three-quarter view, and side profile, all full body, standing relaxed, hair loose. She wears her everyday outfit exactly as in the attached outfit photo (`refs/outfit-everyday.webp`): a dusty-rose pink hip-length kurta with a square neckline, long slightly flared sleeves and side slits, trimmed with fine white scalloped lace at the neckline, cuffs and hem, over wide-leg white palazzo trousers, cream flat ballet shoes. No glasses, no bag. Add a small row of four head-and-shoulders expressions above the figures: soft closed-mouth smile, open bright smile, looking up with quiet hope, eyes closed and calm.
> [Block 2 CHARACTER]
> [Block 1 STYLE]

---

## 1 · Hero: on the rooftop at pre-dawn

File: `pose-hero.png` · eyes-closed variant: `pose-hero-blink.png`

> Full-body three-quarter view of Maria at age 19 standing on a flat Karachi rooftop, looking up and slightly to her right at the sky with quiet hope. Hair loose and moving gently in a sea breeze. Her everyday outfit as in the attached outfit photo (`refs/outfit-everyday.webp`): the dusty-rose pink square-neck kurta with white scalloped lace trim, wide-leg white palazzo trousers, cream flat ballet shoes. No bag. No glasses. Hands relaxed at her sides. Rim light is cool navy-blue from above, with a faint warm amber glow from below as if from streetlights. Nothing else in frame.
> [Block 2 CHARACTER]
> [Block 1 STYLE]

Blink variant: same prompt, replace "looking up and slightly to her right at the sky with quiet hope" with "eyes gently closed, same head angle, same pose exactly".

---

## 2 · London 2010: age 3 in the snow

File: `pose-london.png`

> Full-body front three-quarter view of Maria at age 3, a small toddler, standing in light falling snow with her palms up catching snowflakes, delighted and a little puzzled. She wears a puffy dark-red winter coat, a grey knitted beanie with her dark hair showing loose beneath it, grey mittens, navy trousers, small boots, and an oversized school backpack that is clearly too big for her. Rim light is cool silver-grey. Nothing else in frame.
> [Block 2 CHARACTER] (keep identity, age 3)
> [Block 1 STYLE]

---

## 3 · City School 2015: age 8 with a backpack

File: `pose-cityschool.png` · attach the City School uniform photo as well

> Full-body side three-quarter view of Maria at age 8 walking mid-step to the right with a cheerful expression, school backpack on both shoulders, one hand holding a backpack strap. She wears the CITY SCHOOL UNIFORM exactly as described. Rim light is bright warm sunlight from the top left. Nothing else in frame.
> [Block 3 CITY SCHOOL UNIFORM]
> [Block 2 CHARACTER] (keep identity, age 8)
> [Block 1 STYLE]

---

## 4 · Behind Sharjeel's chair: age 8 peeking

File: `pose-peek.png`

> Full-body three-quarter view of Maria at age 8 standing and leaning forward, chin resting on her hands which rest on the top edge of an office chair back (the chair back only, no person in it), eyes wide and fascinated, lit from the front by the pale blue glow of a computer screen. She wears a plain pale-yellow home t-shirt and grey trousers, barefoot. Hair loose. The chair is a simple dark office chair seen from behind. Nothing else in frame.
> [Block 2 CHARACTER] (keep identity, age 8)
> [Block 1 STYLE]

### Sharjeel, back view (separate render)

File: `pose-sharjeel.png`

> Full-body back view of a teenage boy, age 16, seated in a dark office chair at a desk facing away from the camera, wearing a dark hoodie and a gaming headset, one hand on a mouse. We never see his face. Lit from the front by the pale blue glow of a computer screen so he is mostly a soft silhouette with a blue edge. No desk or monitor in frame, only the boy and the chair.
> [Block 1 STYLE]

---

## 5 · Karsaz 2023: age 16 with a paper plane

File: `pose-karsaz.png` · attach the Karsaz uniform photo as well

> Full-body three-quarter view of Maria at age 16 in the KARSAZ UNIFORM exactly as described, holding a physics notebook under her left arm and a white paper plane raised in her right hand as if about to throw it, looking at the plane with focus and a small smile. No glasses. Rim light is warm golden late-afternoon sun from the right. Nothing else in frame.
> [Block 4 KARSAZ UNIFORM]
> [Block 2 CHARACTER] (keep identity, age 16)
> [Block 1 STYLE]

---

## 6 · The sky said no, 2023: age 18 looking up

File: `pose-sky.png` · eyes-closed variant: `pose-sky-blink.png`

> Full-body back three-quarter view of Maria at age 18, seen mostly from behind with her face turned so we see her profile looking up at the sky, expression still and composed. She wears a crisp white formal shirt, black trousers and black flat shoes. Hair loose down her back, moving slightly in the wind. Hands at her sides, fingers slightly curled. Rim light is dusky purple from above and a faint warm orange from below near her feet. Nothing else in frame.
> [Block 2 CHARACTER] (keep identity, age 18)
> [Block 1 STYLE]

Blink variant: same prompt with "eyes closed, same profile angle, same pose exactly".

---

## 7 · Hello, World: age 19 at the desk

File: `pose-desk.png` · eyes-closed variant: `pose-desk-blink.png`

> Full-body side three-quarter view of Maria at age 19 seated on a simple wooden chair at the near edge of a small desk, typing on a laptop, body facing the laptop, face lit by the laptop screen glow in pale green-white. She wears a dusty-blue kurta with white shalwar and thin round glasses that catch the screen light. Hair loose, tucked behind the ear nearest the camera. Focused, lips slightly parted as if about to smile. Rim light is deep indigo from behind. Include the chair, the desk edge and the laptop; nothing else in frame.
> [Block 2 CHARACTER] (keep identity, age 19, glasses on)
> [Block 1 STYLE]

Blink variant: same prompt with "eyes closed, same angle, same pose exactly".

---

## 8 · What I love: age 19 on the rooftop at night

File: `pose-loves.png`

> Full-body front three-quarter view of Maria at age 19 sitting cross-legged on a flat rooftop, relaxed and happy, holding a small glass cup of milky chai in both hands, over-ear headphones resting around her neck, a closed laptop beside her with a few small stickers on the lid. Hair loose. No glasses. She wears a comfortable deep-terracotta kurta with white shalwar. Rim light is warm amber from below as if from the city lights, with a cool indigo fill from above. Nothing else in frame except the laptop beside her.
> [Block 2 CHARACTER] (keep identity, age 19)
> [Block 1 STYLE]

---

## 9 · The letter: age 19 writing

File: `pose-letter.png` · eyes-closed variant: `pose-letter-blink.png`

> Full-body side three-quarter view of Maria at age 19 seated at the near edge of a small desk writing with a pen on a sheet of paper, head slightly bowed, a soft closed-mouth smile, warm lamp light from a desk lamp on her left side. Hair loose, no glasses. She wears the everyday outfit from the hero scene (attach `refs/outfit-everyday.webp`): the dusty-rose pink square-neck kurta with white lace trim over wide-leg white palazzo trousers. Include the chair, the desk edge, the paper and the pen; nothing else in frame.
> [Block 2 CHARACTER] (keep identity, age 19)
> [Block 1 STYLE]

Blink variant: same prompt with "eyes closed, same angle, same pose exactly".

---

## Ginger (5 renders)

Each prompt is the scene line below plus Block 5 GINGER plus Block 1 STYLE. Because Ginger is lean and playful, the batting and walking poses will get the most screen time, so give those the most candidates.

- `ginger-sit-up.png` — "Full-body side three-quarter view of GINGER sitting upright and looking up and to the right with bright curiosity, tail curled around the paws, ears forward. Rim light cool navy from above."
- `ginger-sit-eyes-closed.png` — "Same sitting pose as before, eyes gently closed, content, same angle exactly."
- `ginger-asleep.png` — "GINGER curled up asleep in a tight circle, seen from slightly above, one ear twitching. Rim light warm amber."
- `ginger-walk.png` — "Full-body side view of GINGER walking to the right with the tail held high, mid-stride, alert and bouncy."
- `ginger-bat.png` — "GINGER up on hind legs, stretching tall and batting at something above with one front paw, playful and mid-motion, tail out for balance."

---

## Checklist before you send

- [ ] Character sheet attached as reference to every Maria generation.
- [ ] Uniform photo attached to the City School and Karsaz generations.
- [ ] Blocks pasted exactly, no rewording.
- [ ] Flat green background on all renders.
- [ ] Full body, head to toe, nothing cropped.
- [ ] Files named exactly as above, saved in `public/_raw/`; uniform photos in `public/_raw/refs/`.
- [ ] If you kept more than one candidate per pose, name them `pose-desk-1.png`, `pose-desk-2.png` and tell me your favourite.
