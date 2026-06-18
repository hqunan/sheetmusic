import { useRef } from "react";
import { INSTRUMENTS, DURATION_MAP } from "../utils/constants";

function noteFrequency(noteName, octave, accidental) {
  const noteMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let semitone = noteMap[noteName.toUpperCase()] ?? 0;
  if (accidental === "sharp") semitone += 1;
  if (accidental === "flat")  semitone -= 1;
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function useAudio() {
  const ctxRef = useRef(null);
  const playbackTimerRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }

  // Play a single frequency
  function playFreq(freq, durationSec, instrument = "piano", startOffset = 0) {
    const ctx = getCtx();
    const inst = INSTRUMENTS.find(i => i.id === instrument) ?? INSTRUMENTS[0];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = inst.oscillator;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

    gain.gain.setValueAtTime(0.3, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + durationSec * 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + durationSec);
  }

  // Play a note object immediately (for input preview)
  function previewNote(note, instrument, tempo) {
    if (note.isRest) return;
    const freq = noteFrequency(note.key, note.octave, note.accidental);
    const beats = (DURATION_MAP[note.duration]?.beats ?? 1) * (note.dotted ? 1.5 : 1);
    const secPerBeat = 60 / tempo;
    playFreq(freq, beats * secPerBeat * 0.85, instrument);
  }

  // Play all parts from the beginning
  function playScore(parts, tempo, onFinish) {
    const secPerBeat = 60 / tempo;
    let totalDuration = 0;

    parts.forEach(part => {
      let t = 0;
      part.measures.forEach(measure => {
        measure.notes.forEach(note => {
          const beats = (DURATION_MAP[note.duration]?.beats ?? 1) * (note.dotted ? 1.5 : 1);
          const durationSec = beats * secPerBeat;
          if (!note.isRest) {
            const freq = noteFrequency(note.key, note.octave, note.accidental);
            playFreq(freq, durationSec * 0.9, part.instrument, t);
          }
          t += durationSec;
          totalDuration = Math.max(totalDuration, t);
        });
      });
    });

    playbackTimerRef.current = setTimeout(onFinish, totalDuration * 1000 + 300);
  }

  function stopScore() {
    clearTimeout(playbackTimerRef.current);
    // Suspend and resume to kill all scheduled sounds
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.suspend().then(() => ctx.resume());
    }
  }

  return { previewNote, playScore, stopScore };
}
