# Generating the avatar renders in Gemini (browser)

Checked against gemini.google.com on 10 October 2026. The ready-to-paste prompts are in `docs/prompts-ready-to-paste.md`; this file is the procedure.

## Before you start

1. Go to **gemini.google.com** and sign in with your Google account.
2. In the left sidebar click **Images**. The page says "Create images… Create with Nano Banana". This is Gemini's image mode. (A normal **New chat** also works if you ask for an image; the Images page just skips a step.)
3. If you have a Google AI Pro or Ultra subscription you may see a model choice that includes a "Pro" image model; pick it, it renders larger and keeps characters more consistent. The free tier works too; images come out around 1024px and I'll upscale.
4. Open `docs/prompts-ready-to-paste.md` in another window. Every prompt there is complete; copy the whole block.
5. Save everything into `C:\Users\mrias\my-app\public\_raw\` (already created). Put your two uniform photos into `public\_raw\refs\` now, named `uniform-cityschool.jpg` and `uniform-karsaz.jpg`. The everyday outfit photo is already there as `outfit-everyday.webp`.

## Step 1 · The character sheet (do this first, nothing else until it's right)

1. On the Images page, click the **+** button ("Upload & tools") → **Upload files** → pick `public\_raw\refs\outfit-everyday.webp`. Then paste prompt **0 · Character sheet** into the box that says "Ask Gemini" and press Enter.
2. Wait for the image. Look at the three views and the four expressions. Ask yourself one question: would a friend recognise this as a cartoon of you? If not, reply in the same chat with a correction, for example "Make the face a little rounder" or "Eyes slightly larger, hair thicker", and Gemini edits the sheet.
3. Repeat until it's right. Generate at least three versions; keep the one that looks most like you.
4. Download it: hover the image, click the **download** icon (or click the image to open it full size, then download). Save as `sheet-maria.png` in `public\_raw\`. A .jpg is fine too; don't convert anything.
5. Send me the sheet before doing the scenes. I'll check for things that cause drift across poses.

## Step 2 · Each scene (nine for Maria, one for Sharjeel)

Do one scene per chat so earlier images don't bleed into the next one.

1. Click **New chat** in the sidebar, then **Images** (or stay on the Images page and start fresh).
2. Click the **+** button (its tooltip says "Upload & tools") → **Upload files** → pick `sheet-maria.png`. For the hero and letter scenes also upload `outfit-everyday.webp`; for the City School scene also upload `uniform-cityschool.jpg`; for the Karsaz scene also upload `uniform-karsaz.jpg`.
3. Paste the scene prompt and press Enter.
4. Judge the result against the sheet: same face, same hair, full body with feet and head not cropped, flat green background.
5. For more candidates, reply "Another version of the same prompt, keep the character identical" two or three times. Keep the best one.
6. Download, rename exactly as the prompt file says (for example `pose-hero.png`), save to `public\_raw\`.

Recommended order: hero → desk → letter → loves → sky → karsaz → cityschool → peek → london → sharjeel. The adult poses first, because they establish the look; the child poses last, because they're the hardest and you'll be practised by then.

## Step 3 · The blink variants (four of them)

This is the one trick that makes the site feel alive, and it only works inside the same chat as the good pose.

1. Right after you have the pose you're keeping (hero, sky, desk, letter), reply in the same chat: **"Edit this image: keep everything exactly the same, only close her eyes gently."**
2. Gemini edits in place and keeps the pose, clothes and lighting identical. Download as `pose-hero-blink.png` (and the same pattern for sky, desk, letter).
3. If anything other than the eyes changed, reply "No, keep the pose and clothing identical to the previous image, change only the eyes" and try again.

## Step 4 · Ginger (five renders)

1. New chat → Images. No reference needed for the first one; paste **ginger-sit-up**.
2. When you like the cat, download it as `ginger-sit-up.png`, then in the same chat reply "Edit this image: same cat, same pose, eyes gently closed" and save that as `ginger-sit-eyes-closed.png`.
3. For the other three poses, start a new chat and upload `ginger-sit-up.png` as the reference, then paste the prompt. Save as `ginger-asleep.png`, `ginger-walk.png`, `ginger-bat.png`.

## Fixes for the usual problems

| What you see | What to reply |
|---|---|
| Background is a room, a gradient, or any colour but green | "Edit this image: replace the background with a flat solid green #00B140 and change nothing else." |
| Face drifted from the sheet | Re-upload the sheet and add "Do not change the face from the attached reference" at the top of the prompt. |
| Feet or head cropped | "Full body head to toe with clear margin above the head and below the feet, portrait 2:3." |
| Text, logos or a second person appeared | "Remove all text and extra figures, keep everything else." Or just regenerate. |
| A small Gemini logo in a corner | Ignore it; it sits in the green area and I remove it. If it overlaps her, regenerate. |
| Gemini hesitates on the age-3 or age-8 prompts | Add "a wholesome animated-film child character" to the first line and resend. |
| You hit the daily image limit | Stop for the day; the limit resets. The sheet and the four adult poses are the priority. |

## What I need back

- `sheet-maria.png`
- `pose-hero.png`, `pose-hero-blink.png`
- `pose-london.png`
- `pose-cityschool.png`
- `pose-peek.png`, `pose-sharjeel.png`
- `pose-karsaz.png`
- `pose-sky.png`, `pose-sky-blink.png`
- `pose-desk.png`, `pose-desk-blink.png`
- `pose-loves.png`
- `pose-letter.png`, `pose-letter-blink.png`
- `ginger-sit-up.png`, `ginger-sit-eyes-closed.png`, `ginger-asleep.png`, `ginger-walk.png`, `ginger-bat.png`

Twenty files plus the sheet. Expect 40 to 60 generations including the ones you throw away. Two sittings is realistic.
