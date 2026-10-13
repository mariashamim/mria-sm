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
  /** Which rail year lights up while this chapter is active. null = none (hero). */
  rail: (typeof RAIL_YEARS)[number] | null
  /** The big display year shown in the chapter. */
  year: string
  title: string
  urdu: string
  urduMeaning: string
  /** Which UI colour reads against this chapter's sky. */
  ui: 'ink' | 'paper'
  /** Pinned scroll length, as a multiple of the viewport height. */
  pin: number
  /** Sky keyframes in local progress (0..1) → sky stop index (see lib/sky.ts). */
  sky: Keyframe[]
  /** Draft copy, one entry per revealed line. Maria rewrites what isn't hers. */
  lines: string[]
  /** Renders placed in the chapter's figure slot, left to right. */
  figures?: Figure[]
}

export const RAIL_YEARS = ['2007', '2010', '2011', '2017', '2023', 'NOW'] as const

export const chapters: Chapter[] = [
  {
    id: 'hero',
    index: 0,
    rail: null,
    year: 'NOW',
    title: 'The rooftop, before dawn',
    urdu: 'آسمان',
    urduMeaning: 'sky',
    ui: 'paper',
    pin: 2,
    sky: [
      { at: 0, stop: 0 },
      { at: 0.55, stop: 0 },
      { at: 1, stop: 1 },
    ],
    lines: [],
  },
  {
    id: 'karachi',
    index: 1,
    rail: '2007',
    year: '2007',
    title: 'Karachi',
    urdu: 'گھر',
    urduMeaning: 'home',
    ui: 'ink',
    pin: 2.5,
    sky: [
      { at: 0, stop: 1 },
      { at: 0.7, stop: 1 },
      { at: 1, stop: 2 },
    ],
    lines: ['Born under the Karachi sky in 2007.', "I didn't know then that I'd spend the next fifteen years looking up."],
    figures: [{ pose: 'pose-karachi', alt: 'Maria at two, a toddler in a little cotton frock on the rooftop, pointing up at the Karachi sky' }],
  },
  {
    id: 'london',
    index: 2,
    rail: '2010',
    year: '2010',
    title: 'London, briefly',
    urdu: 'برف',
    urduMeaning: 'snow',
    ui: 'ink',
    pin: 3,
    sky: [
      { at: 0, stop: 2 },
      { at: 0.72, stop: 2 },
      { at: 1, stop: 3 },
    ],
    lines: [
      'When I was three we moved to London.',
      "It didn't stick.",
      'I remember the snow more than the school.',
      'Southall sounded like home with a different accent.',
    ],
    figures: [{ pose: 'pose-london', alt: 'Maria at three, in a red puffer coat and a grey beanie, catching snow with mittened hands' }],
  },
  {
    id: 'home',
    index: 3,
    rail: '2011',
    year: '2011',
    title: 'Back home',
    urdu: 'دوستی',
    urduMeaning: 'friendship',
    ui: 'ink',
    pin: 3.5,
    sky: [
      { at: 0, stop: 3 },
      { at: 0.72, stop: 3 },
      { at: 1, stop: 4 },
    ],
    lines: [
      'Back in Karachi. City School, and a group of friends I still have.',
      'Sharjeel had the PC first. I had the chair behind him.',
      "That's where the whole thing started, if I'm honest.",
    ],
    figures: [{ pose: 'pose-home', alt: 'Sharjeel at the family PC in a headset, Maria at eight peeking over the back of his chair, both lit by the screen', size: 'wide' }],
  },
  {
    id: 'karsaz',
    index: 4,
    rail: '2017',
    year: '2017',
    title: 'Karsaz',
    urdu: 'حساب',
    urduMeaning: 'calculation',
    ui: 'ink',
    pin: 3,
    sky: [
      { at: 0, stop: 4 },
      { at: 0.72, stop: 4 },
      { at: 1, stop: 5 },
    ],
    lines: ['Bahria College Karsaz. Pre-engineering.', 'Maths, physics, and a plan:', 'I was going to fly.'],
    figures: [{ pose: 'pose-karsaz', alt: 'Maria at sixteen in the Karsaz uniform, a physics notebook under one arm and a paper plane raised in the other hand' }],
  },
  {
    id: 'sky',
    index: 5,
    rail: '2023',
    year: '2023',
    title: 'The window closed',
    urdu: 'آسمان',
    urduMeaning: 'sky',
    ui: 'paper',
    pin: 4.5,
    sky: [
      { at: 0, stop: 5 },
      { at: 0.3, stop: 5 },
      { at: 0.72, stop: 6 },
      { at: 0.88, stop: 6 },
      { at: 1, stop: 7 },
    ],
    lines: [
      'I applied to the Air Force. GD Pilot.',
      'I wanted the sky.',
      'My eyesight failed the medical test.',
      'They closed the window to the sky.',
      'So I opened a terminal window.',
    ],
    figures: [{ pose: 'pose-sky', alt: 'Maria at eighteen in a white shirt and black trousers, seen from behind, looking up at the sky', blink: true, size: 'large' }],
  },
  {
    id: 'hello',
    index: 6,
    rail: '2023',
    year: '2023',
    title: 'Hello, World',
    urdu: 'پہلا',
    urduMeaning: 'first',
    ui: 'paper',
    pin: 4,
    sky: [
      { at: 0, stop: 7 },
      { at: 0.75, stop: 7 },
      { at: 1, stop: 8 },
    ],
    lines: [
      'First semester. Computer Science, Bahria University.',
      'Two words printed across a black screen, but it felt like the warmest welcome.',
      'It did exactly what I told it to. The sky had closed its doors, but right here, I had found my ground.',
    ],
    figures: [{ pose: 'pose-desk', alt: 'Maria at nineteen at a small wooden desk, round glasses catching the laptop light, typing', blink: true, size: 'normal' }],
  },
  {
    id: 'loves',
    index: 7,
    rail: 'NOW',
    year: 'NOW',
    title: 'What I love',
    urdu: 'چائے',
    urduMeaning: 'chai',
    ui: 'paper',
    pin: 3.5,
    sky: [
      { at: 0, stop: 8 },
      { at: 1, stop: 8 },
    ],
    lines: [
      'Things that are mine, no grades attached.',
      'Chai. Non-negotiable.',
      'Valorant when I want to lose, Minecraft when I want to build, chess when I want to think.',
      'Coke Studio on repeat. Yes, still.',
      'Padel, badminton and table tennis.',
    ],
    figures: [{ pose: 'pose-loves', alt: 'Maria cross-legged on the rooftop at night with a cup of chai, headphones around her neck, a stickered laptop beside her', size: 'large', mask: 'floor' }],
  },
  {
    id: 'letter',
    index: 8,
    rail: 'NOW',
    year: 'NOW',
    title: 'A letter',
    urdu: 'خط',
    urduMeaning: 'letter',
    ui: 'paper',
    pin: 4,
    sky: [
      { at: 0, stop: 8 },
      { at: 0.5, stop: 8 },
      { at: 1, stop: 9 },
    ],
    lines: [
      'To the three-year-old in Southall,',
      "You're going to remember the snow more than the school. That's fine.",
      "Hold on to the friends from City School; you'll still have them.",
      "Sit behind Sharjeel's chair as long as he lets you.",
      'Learn the physics. Apply for the sky.',
      "When they close the window, don't argue with it.",
      "You'll find the sky anyway. It's just not where you're looking.",
      '— M.',
    ],
    figures: [{ pose: 'pose-letter', alt: 'Maria at the desk under a lamp, writing a letter by hand', blink: true, size: 'large' }],
  },
]
