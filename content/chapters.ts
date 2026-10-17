export type Keyframe = { at: number; stop: number }
export type SkyKeyframe = Keyframe

export type Figure = {
  /** Base name in public/avatar. */
  pose: string
  alt: string
  blink?: boolean
  /** Relative size inside the figure slot. 'wide' is for landscape scene renders. */
  size?: 'small' | 'normal' | 'large' | 'wide'
  /** The chai render includes a real rooftop slab; fade its bottom edge. */
  mask?: 'floor'
}

export type Chapter = {
  id: string
  index: number
  /** Which rail year lights up while this chapter is active. null = none (the opening). */
  rail: (typeof RAIL_YEARS)[number] | null
  /** The big display year shown in the chapter; empty for sections without one. */
  year: string
  /** The section's name: its heading where it shows one, and its name in the menu. */
  title: string
  /** The Urdu word and its meaning, where the section has one. */
  urdu?: string
  urduMeaning?: string
  /** Which UI colour reads against this chapter's sky. */
  ui: 'ink' | 'paper'
  /**
   * How long this chapter holds the stage, in viewport heights of scroll (×0.7 on touch).
   * The chapter's content timeline is stretched or squeezed to fill exactly this much;
   * the forming and dissolving between chapters adds about 0.4 more. Vary it so quick
   * and slow chapters alternate: London is brief, the plan changing is the longest.
   */
  scroll: number
  /** Sky keyframes in local progress (0..1) → sky stop index (see lib/sky.ts). */
  sky: Keyframe[]
  /** Maria's copy, one entry per paragraph, word for word. */
  lines: string[]
  /** The opening's call to scroll, shown under its lines. */
  cue?: string
  /** Renders placed in the chapter's figure slot, left to right. */
  figures?: Figure[]
  /** A postscript under the lines, with the doors (content/links.ts) beneath it. */
  ps?: string[]
}

export const RAIL_YEARS = ['2007', '2010', '2011', '2017', '2023', '2024', 'NOW'] as const

export const chapters: Chapter[] = [
  {
    id: 'hero',
    index: 0,
    rail: null,
    year: '',
    title: 'Opening',
    urdu: 'آسمان',
    urduMeaning: 'sky',
    ui: 'paper',
    scroll: 1.6,
    sky: [
      { at: 0, stop: 0 },
      { at: 0.55, stop: 0 },
      { at: 1, stop: 1 },
    ],
    lines: ['Well, where do I even begin?', "I'm Maria. This is a little story about where I came from, what I wanted to be, and how I ended up here."],
    cue: 'Scroll to begin ↓',
  },
  {
    id: 'karachi',
    index: 1,
    rail: '2007',
    year: '2007',
    title: 'Karachi, August 2007',
    urdu: 'گھر',
    urduMeaning: 'home',
    ui: 'ink',
    scroll: 2.2,
    sky: [
      { at: 0, stop: 1 },
      { at: 0.7, stop: 1 },
      { at: 1, stop: 2 },
    ],
    lines: ['Born in Karachi in August 2007.', 'No big plans, no idea what the future had in store. Just the beginning of everything.'],
    figures: [{ pose: 'pose-karachi', alt: 'Maria at two, a toddler in a little cotton frock on the rooftop, holding a kite string and looking up' }],
  },
  {
    id: 'london',
    index: 2,
    rail: '2010',
    year: '2010',
    title: 'London, 2010',
    urdu: 'برف',
    urduMeaning: 'snow',
    ui: 'ink',
    scroll: 1.6,
    sky: [
      { at: 0, stop: 2 },
      { at: 0.72, stop: 2 },
      { at: 1, stop: 3 },
    ],
    lines: ['In 2010, my family moved to London.', 'I was still very young, but one thing I associate with that time is seeing snow.'],
    figures: [{ pose: 'pose-london', alt: 'Maria at three, in a red puffer coat and a grey beanie, catching snow with mittened hands' }],
  },
  {
    id: 'home',
    index: 3,
    rail: '2011',
    year: '2011',
    title: 'Back to Karachi, 2011',
    urdu: 'دوستی',
    urduMeaning: 'friendship',
    ui: 'ink',
    scroll: 2.4,
    sky: [
      { at: 0, stop: 3 },
      { at: 0.72, stop: 3 },
      { at: 1, stop: 3.5 },
    ],
    lines: ['We returned to Karachi in 2011.', 'Life carried on, I grew up, and school became a big part of my world.'],
    figures: [{ pose: 'pose-home', alt: 'Sharjeel at the family PC in a headset, Maria at eight peeking over the back of his chair, both lit by the screen', size: 'wide' }],
  },
  {
    id: 'school',
    index: 4,
    rail: '2011',
    year: '',
    title: 'School years',
    urdu: 'سبق',
    urduMeaning: 'lesson',
    ui: 'ink',
    scroll: 2.2,
    sky: [
      { at: 0, stop: 3.5 },
      { at: 0.7, stop: 3.5 },
      { at: 1, stop: 4 },
    ],
    lines: [
      'School, friends, exams, and figuring things out as I went.',
      "I didn't have my future all planned out. Honestly, I was still discovering what I liked.",
    ],
    figures: [{ pose: 'pose-cityschool', alt: 'Maria in her City School uniform, a backpack on one shoulder and her hair in a long braid, walking and smiling' }],
  },
  {
    id: 'karsaz',
    index: 5,
    rail: '2017',
    year: '2017',
    title: 'Bahria College Karsaz',
    urdu: 'حساب',
    urduMeaning: 'calculation',
    ui: 'ink',
    scroll: 2.4,
    sky: [
      { at: 0, stop: 4 },
      { at: 0.72, stop: 4 },
      { at: 1, stop: 5 },
    ],
    lines: [
      'I studied pre-engineering at Bahria College Karsaz, with one big goal in mind: becoming a pilot.',
      'In 2023, I applied to become a GD pilot in the Air Force.',
    ],
    figures: [{ pose: 'pose-karsaz', alt: 'Maria at sixteen in the Karsaz uniform, a physics notebook under one arm and a paper plane raised in the other hand' }],
  },
  {
    id: 'sky',
    index: 6,
    rail: '2023',
    year: '2023',
    title: 'The plan changed',
    urdu: 'آسمان',
    urduMeaning: 'sky',
    ui: 'paper',
    scroll: 6,
    sky: [
      { at: 0, stop: 5 },
      { at: 0.3, stop: 5 },
      { at: 0.72, stop: 6 },
      { at: 0.88, stop: 6 },
      { at: 1, stop: 7 },
    ],
    lines: [
      "I didn't meet the medical requirements because of my eyesight, so aviation wasn't an option anymore.",
      "It wasn't the outcome I'd hoped for. I had to rethink what came next.",
    ],
    figures: [{ pose: 'pose-sky', alt: 'Maria at sixteen in a white shirt and black trousers, seen from behind, looking up at the sky', blink: true, size: 'large' }],
  },
  {
    id: 'hello',
    index: 7,
    rail: '2024',
    year: '2024',
    title: 'Bahria University, 2024',
    urdu: 'پہلا',
    urduMeaning: 'first',
    ui: 'paper',
    scroll: 3.4,
    sky: [
      { at: 0, stop: 7 },
      { at: 0.75, stop: 7 },
      { at: 1, stop: 8 },
    ],
    lines: [
      'In 2024, I started studying Computer Science at Bahria University.',
      "A different path from the one I'd imagined, but one I'm exploring, one project and one bug at a time.",
      'They closed the window to the sky. So I opened a terminal window.',
    ],
    figures: [{ pose: 'pose-desk', alt: 'Maria at seventeen at a small wooden desk, round glasses catching the laptop light, typing', blink: true, size: 'normal' }],
  },
  {
    id: 'loves',
    index: 8,
    rail: 'NOW',
    year: '',
    title: 'Outside the classroom',
    urdu: 'چائے',
    urduMeaning: 'chai',
    ui: 'paper',
    scroll: 2.4,
    sky: [
      { at: 0, stop: 8 },
      { at: 1, stop: 8 },
    ],
    lines: [
      'Gaming, chess, music, sports, and chai.',
      'I like exploring new things, building stuff, and occasionally doing absolutely nothing productive. Balance, right?',
    ],
    figures: [{ pose: 'pose-loves', alt: 'Maria cross-legged on the rooftop at night with a cup of chai, headphones around her neck, a stickered laptop beside her', size: 'large', mask: 'floor' }],
  },
  {
    id: 'explore',
    index: 9,
    rail: 'NOW',
    year: '',
    title: 'Explore',
    urdu: 'تلاش',
    urduMeaning: 'exploring',
    ui: 'paper',
    scroll: 2.4,
    sky: [
      { at: 0, stop: 8 },
      { at: 1, stop: 8 },
    ],
    lines: [
      'Enough about me. Have a look around.',
      'Try the terminal. Play some Sudoku. Click around and see what you find. Not everything needs an explanation.',
    ],
  },
  {
    id: 'letter',
    index: 10,
    rail: 'NOW',
    year: '',
    title: 'A letter',
    urdu: 'خط',
    urduMeaning: 'letter',
    ui: 'paper',
    scroll: 6,
    sky: [
      { at: 0, stop: 8 },
      { at: 0.4, stop: 8 },
      { at: 1, stop: 9 },
    ],
    lines: [
      'To the little girl who wanted to fly,',
      "You won't become a pilot. I know that's hard to hear.",
      "You'll have to let go of a dream you held onto for years, and find a different way forward.",
      "But you won't stop being curious. You'll find new things to build, problems to solve, and a world beyond the one you imagined.",
      "You don't need to have it all figured out yet.",
      "The sky isn't the only place worth exploring.",
      '— M.',
    ],
    ps: ["P.S. If you're in Karachi, the chai is on me. If not, save me a game of chess."],
    figures: [{ pose: 'pose-letter', alt: 'Maria at the desk under a lamp, writing a letter by hand', blink: true, size: 'large' }],
  },
  {
    id: 'closing',
    index: 11,
    rail: 'NOW',
    year: '',
    title: 'Closing',
    urdu: 'سفر',
    urduMeaning: 'journey',
    ui: 'ink',
    scroll: 2.8,
    sky: [
      { at: 0, stop: 9 },
      { at: 0.6, stop: 10 },
      { at: 1, stop: 10 },
    ],
    lines: [
      'Still figuring it out.',
      'From Karachi to London and back, from wanting to fly to learning to code.',
      "I'm still learning, still exploring, and still writing the next chapter.",
      'Thanks for stopping by.',
    ],
  },
]
