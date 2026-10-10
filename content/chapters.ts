export type SkyKeyframe = { at: number; stop: number }

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
  sky: SkyKeyframe[]
  /** Draft copy, one entry per revealed line. Maria rewrites what isn't hers. */
  lines: string[]
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
    lines: [
      'I was born in Karachi in 2007.',
      'A loud city got one more voice.',
      '(Ginger came much later. She insists on being in every scene anyway.)',
    ],
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
  },
  {
    id: 'sky',
    index: 5,
    rail: '2023',
    year: '2023',
    title: 'The sky said no',
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
      'The sky said no.',
      "I didn't have a plan B. I had a laptop.",
    ],
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
      'The first time the machine did exactly what I told it to,',
      'something clicked that the sky never did.',
      'Then I built Kafeel, because Karachi has no real system for its elderly, and that felt like a gap someone should fill.',
    ],
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
      'Doodh patti. Non-negotiable.',
      'Valorant when I want to lose, Minecraft when I want to build, chess when I want to think.',
      'Coke Studio on repeat. Yes, still.',
      'Not cricket. Badminton and table tennis. I will not be taking questions.',
      'Ginger. Orange. In charge.',
    ],
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
      "When it says no, don't argue with it.",
      "You'll find the sky anyway. It's just not where you're looking.",
      '— M.',
    ],
  },
]
