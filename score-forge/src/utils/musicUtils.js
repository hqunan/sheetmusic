import { PITCH_ORDER, STAFF } from "./constants";

// ── Pitch → SVG Y position ────────────────────────────────────────────────
// Returns pixel Y for a given note on the staff.
// Reference points:
//   treble: B4 sits on the 3rd staff line (from top, index 2)
//   bass:   D3 sits on the 3rd staff line
export function pitchToY(noteName, octave, clef) {
  const pos = PITCH_ORDER.indexOf(noteName.toUpperCase());
  const steps = octave * 7 + pos;           // absolute diatonic step count
  const ref   = clef === "treble" ? 34 : 27; // B4 = 4*7+6=34 | D3 = 3*7+2=27... using step math
  const stepsFromRef = ref - steps;          // positive → below reference
  return STAFF.TOP_Y + (stepsFromRef * STAFF.LINE_GAP) / 2;
}

// ── Ledger lines needed for a note ───────────────────────────────────────
// Returns array of Y values where ledger lines should be drawn.
export function getLedgerLines(noteY) {
  const lines = [];
  const { TOP_Y, LINE_GAP } = STAFF;
  const bottomY = TOP_Y + LINE_GAP * 4;

  // Above staff
  for (let y = TOP_Y - LINE_GAP; y >= noteY - 2; y -= LINE_GAP) {
    lines.push(y);
  }
  // Below staff
  for (let y = bottomY + LINE_GAP; y <= noteY + 2; y += LINE_GAP) {
    lines.push(y);
  }
  return lines;
}

// ── Stem direction ────────────────────────────────────────────────────────
// Notes below middle line → stem up; above → stem down.
export function stemUp(noteY) {
  const middleLineY = STAFF.TOP_Y + STAFF.LINE_GAP * 2;
  return noteY > middleLineY;
}

// ── Note spacing in a measure ─────────────────────────────────────────────
// Given note count and measure width, return per-note x spacing.
export function noteSpacing(noteCount) {
  const usableW = STAFF.BAR_W - 24;
  return noteCount > 0 ? Math.min(usableW, usableW / Math.max(noteCount, 4)) : 36;
}

// ── Beats used in a note list ─────────────────────────────────────────────
export function totalBeats(notes, durationMap) {
  return notes.reduce((sum, n) => {
    const base = durationMap[n.duration]?.beats ?? 1;
    return sum + base * (n.dotted ? 1.5 : 1);
  }, 0);
}
