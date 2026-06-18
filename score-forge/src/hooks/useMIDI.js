import { useState, useRef, useEffect } from "react";
import { MIDI_NOTE_NAMES } from "../utils/constants";

function midiToNote(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const name = MIDI_NOTE_NAMES[midi % 12];
  const isSharp = name.includes("#");
  return {
    key: isSharp ? name.replace("#", "") : name,
    octave,
    accidental: isSharp ? "sharp" : null,
  };
}

export function useMIDI({ onNoteOn }) {
  const [status, setStatus] = useState("not_requested"); // not_requested | connecting | connected | error
  const accessRef = useRef(null);
  const callbackRef = useRef(onNoteOn);

  // Keep callback ref fresh so MIDI handler always sees latest version
  useEffect(() => { callbackRef.current = onNoteOn; }, [onNoteOn]);

  function handleMIDIMessage(msg) {
    const [statusByte, noteNum, velocity] = msg.data;
    const isNoteOn = (statusByte & 0xf0) === 0x90 && velocity > 0;
    if (isNoteOn) {
      callbackRef.current(midiToNote(noteNum));
    }
  }

  async function connect() {
    if (!navigator.requestMIDIAccess) {
      setStatus("error");
      return "Browser không hỗ trợ Web MIDI API.";
    }
    setStatus("connecting");
    try {
      const access = await navigator.requestMIDIAccess();
      accessRef.current = access;

      // Register all current inputs
      access.inputs.forEach(input => { input.onmidimessage = handleMIDIMessage; });

      // Auto-register new inputs plugged in later
      access.onstatechange = (e) => {
        if (e.port.type === "input") {
          e.port.onmidimessage = handleMIDIMessage;
        }
      };

      setStatus("connected");
      return null; // no error
    } catch (e) {
      setStatus("error");
      return e.message;
    }
  }

  function disconnect() {
    if (accessRef.current) {
      accessRef.current.inputs.forEach(input => { input.onmidimessage = null; });
    }
    setStatus("not_requested");
  }

  return { status, connect, disconnect };
}
