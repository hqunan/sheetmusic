import { useState } from "react";
import { DURATION_MAP } from "../utils/constants";

const DEFAULT_MEASURES = () => Array.from({ length: 4 }, () => ({ notes: [] }));

const DEFAULT_PARTS = [
  { id: 1, name: "Violin I",  clef: "treble", instrument: "violin", timeSig: "4/4", measures: DEFAULT_MEASURES() },
  { id: 2, name: "Violin II", clef: "treble", instrument: "violin", timeSig: "4/4", measures: DEFAULT_MEASURES() },
  { id: 3, name: "Piano",     clef: "bass",   instrument: "piano",  timeSig: "4/4", measures: DEFAULT_MEASURES() },
];

export function useScore() {
  const [parts, setParts] = useState(DEFAULT_PARTS);
  const [title, setTitle] = useState("Untitled Score");
  const [composer, setComposer] = useState("");
  const [tempo, setTempo] = useState(120);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function cloneState(prev) {
    return JSON.parse(JSON.stringify(prev));
  }

  function beatsInMeasure(notes) {
    return notes.reduce((sum, n) => {
      const base = DURATION_MAP[n.duration]?.beats ?? 1;
      return sum + base * (n.dotted ? 1.5 : 1);
    }, 0);
  }

  // ── Note CRUD ──────────────────────────────────────────────────────────────
  function addNote({ partIdx, measureIdx, afterNoteIdx, note }) {
    let nextMeasure = measureIdx;
    let nextNoteIdx = afterNoteIdx;

    setParts(prev => {
      const next = cloneState(prev);
      const measure = next[partIdx].measures[measureIdx];

      if (afterNoteIdx !== null && afterNoteIdx < measure.notes.length) {
        measure.notes.splice(afterNoteIdx + 1, 0, note);
        nextNoteIdx = afterNoteIdx + 1;
      } else {
        measure.notes.push(note);
        nextNoteIdx = measure.notes.length - 1;
      }

      // Auto-advance measure when full
      const [beatsPerBar] = (next[partIdx].timeSig || "4/4").split("/").map(Number);
      if (beatsInMeasure(measure.notes) >= beatsPerBar) {
        if (measureIdx < next[partIdx].measures.length - 1) {
          nextMeasure = measureIdx + 1;
          nextNoteIdx = null;
        }
      }

      return next;
    });

    return { nextMeasure, nextNoteIdx };
  }

  function deleteNote({ partIdx, measureIdx, noteIdx }) {
    setParts(prev => {
      const next = cloneState(prev);
      next[partIdx].measures[measureIdx].notes.splice(noteIdx, 1);
      return next;
    });
  }

  function updateNote({ partIdx, measureIdx, noteIdx, changes }) {
    setParts(prev => {
      const next = cloneState(prev);
      Object.assign(next[partIdx].measures[measureIdx].notes[noteIdx], changes);
      return next;
    });
  }

  // ── Measure CRUD ───────────────────────────────────────────────────────────
  function addMeasure() {
    setParts(prev => {
      const next = cloneState(prev);
      next.forEach(p => p.measures.push({ notes: [] }));
      return next;
    });
  }

  function deleteMeasure(measureIdx) {
    setParts(prev => {
      const next = cloneState(prev);
      if (next[0].measures.length <= 1) return prev;
      next.forEach(p => p.measures.splice(measureIdx, 1));
      return next;
    });
  }

  // ── Part CRUD ──────────────────────────────────────────────────────────────
  function addPart() {
    setParts(prev => {
      const measureCount = prev[0].measures.length;
      return [...prev, {
        id: Date.now(),
        name: `Part ${prev.length + 1}`,
        clef: "treble",
        instrument: "violin",
        timeSig: "4/4",
        measures: Array.from({ length: measureCount }, () => ({ notes: [] })),
      }];
    });
  }

  function removePart(idx) {
    setParts(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }

  function updatePart(idx, field, value) {
    setParts(prev => {
      const next = cloneState(prev);
      next[idx][field] = value;
      return next;
    });
  }

  return {
    parts, title, setTitle, composer, setComposer, tempo, setTempo,
    addNote, deleteNote, updateNote,
    addMeasure, deleteMeasure,
    addPart, removePart, updatePart,
  };
}
