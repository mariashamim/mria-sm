/**
 * Words for the interactive pieces. Maria's voice; edit freely.
 */

/** Hello, World: what the terminal says back. */
export const WHOAMI = ['maria. 19. karachi.', 'computer science, bahria university.', 'wanted the sky. writes code instead. still looks up.']

export const HELP = [
  'help       this list',
  'whoami     who is typing',
  'ls         the chapters',
  'cd <year>  jump to one, e.g. cd 2007',
  'chai       email me',
  'chess      challenge me',
  'hello      linkedin',
  'sudoku     the one I wrote in assembly',
  'clear      clean the screen',
]

/** The window closed: the chart from the medical. */
export const EYE_CHART = {
  head: ['Visual acuity', '6/6 required'],
  rows: ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P', 'F E L O P Z D', 'D E F P O T E C'],
  acuity: ['6/60', '6/36', '6/24', '6/18', '6/12', '6/9', '6/6', '6/5'],
  sizes: [52, 38, 28, 22, 18, 14, 11, 9],
  ask: 'Read the last line.',
  fail: 'Neither could I.',
}

/** What I love: the puzzle. */
export const MATE = {
  ask: 'White to move. Mate in one.',
  wrong: ['Not mate. Try again.', 'Still not mate.', 'Hint: the back rank.'],
  solved: 'Checkmate.',
  cta: 'Your move: challenge me',
}

/** Karsaz: the year worked out by hand above it (born 2007, ten when she started there). */
export const KARSAZ_SUM = ['2007', '+ 10']

/**
 * Hidden terminal commands, for the curious (not listed in help). Their words
 * come from her own story; edit freely.
 */
export const SECRETS = {
  sudoFly: ['sudo: permission denied.', 'they closed the window to the sky.', 'this one is open, though. try: cd 2024'],
  chaiTxt: ['chai.txt: non-negotiable.', "if you're in karachi, it's on her. type chai."],
  // SUGGESTED, awaiting Maria's approval: cat letter.txt.
  catLetter: ['to the little girl who wanted to fly,', '...the rest is on paper. keep scrolling.'],
}

/**
 * Explore desk: the labels on the paper objects, the eye test's words, and the
 * two handwritten notes. The notes are PLACEHOLDERS until Maria writes them.
 */
export const DESK = {
  labels: {
    laptop: 'Terminal',
    sudoku: 'Sudoku',
    eye: 'Eye test',
    chess: 'Chess puzzle',
    chai: 'Chai',
    music: 'Music',
  },
  eye: { ask: 'Read the last line.', placeholder: 'Type what you see' },
  notes: {
    chai: ['[Placeholder: a short note about chai, in Maria’s words.]'],
    music: ['[Placeholder: a short note about Coke Studio and music, in Maria’s words.]'],
  },
}

/**
 * The closing's dream planes. The question and the button are Maria's words;
 * the two lines after are the card's own. The planes in the sky come from
 * data/dreams.json (Maria edits that file); the visitor's own plane stays in
 * their browser and is never sent anywhere.
 */
export const DREAMS = {
  ask: 'What did you want to be when you were little?',
  placeholder: 'an astronaut',
  button: 'Fold it into a plane',
  done: 'It’s up there now, on your screen only.',
  again: 'Fold another',
}
