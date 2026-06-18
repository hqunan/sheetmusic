export const DURATION_MAP = {
  "1":  { vex: "w",  beats: 4,    label: "Tròn",     symbol: "𝅝"  },
  "2":  { vex: "h",  beats: 2,    label: "Trắng",    symbol: "𝅗𝅥"  },
  "4":  { vex: "q",  beats: 1,    label: "Đen",      symbol: "♩"  },
  "8":  { vex: "8",  beats: 0.5,  label: "Móc đơn",  symbol: "♪"  },
  "16": { vex: "16", beats: 0.25, label: "Móc kép",  symbol: "𝅘𝅥𝅯" },
};

export const MIDI_NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const CLEFS = [
  { id: "treble", label: "Treble (Khóa Sol)" },
  { id: "bass",   label: "Bass (Khóa Fa)"   },
];

export const INSTRUMENTS = [
  { id: "piano",  label: "🎹 Piano",  oscillator: "triangle" },
  { id: "violin", label: "🎻 Violin", oscillator: "sawtooth" },
  { id: "flute",  label: "🪈 Flute",  oscillator: "sine"     },
  { id: "guitar", label: "🎸 Guitar", oscillator: "triangle" },
];

export const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "12/8"];

// Keyboard key → note name
export const KEY_NOTE_MAP = {
  a: "C", s: "D", d: "E", f: "F", g: "G", h: "A", j: "B",
};

// Pitch order for SVG staff layout
export const PITCH_ORDER = ["C", "D", "E", "F", "G", "A", "B"];

// Staff geometry constants (in SVG units)
export const STAFF = {
  TOP_Y:      50,
  LINE_GAP:   10,
  CLEF_W:     42,
  TIMESIG_W:  28,
  BAR_W:      160,
  BAR_GAP:    8,
  NOTE_RX:    6,
  NOTE_RY:    4.5,
  STEM_LEN:   32,
  SVG_HEIGHT: 130,
};
