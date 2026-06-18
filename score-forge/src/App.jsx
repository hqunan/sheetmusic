import { useState, useEffect, useCallback } from "react";

// Hooks
import { useScore }  from "./hooks/useScore";
import { useMIDI }   from "./hooks/useMIDI";
import { useAudio }  from "./hooks/useAudio";

// Components
import Header       from "./components/Header";
import Toolbar      from "./components/Toolbar";
import Staff        from "./components/Staff";
import PartSettings from "./components/PartSettings";
import SetupModal   from "./components/SetupModal";

// Utils
import { KEY_NOTE_MAP, DURATION_MAP } from "./utils/constants";
import { downloadMusicXML }           from "./utils/exportXML";

// ── App ──────────────────────────────────────────────────────────────
export default function App() {
  // ── Score state (notes, parts, title…) ──────────────────────────────────
  const score = useScore();

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedDuration,   setSelectedDuration]   = useState("4");
  const [selectedAccidental, setSelectedAccidental] = useState(null);
  const [inputMode,          setInputMode]          = useState("note"); // "note" | "rest"
  const [isDotted,           setIsDotted]           = useState(false);
  const [selectedPart,       setSelectedPart]       = useState(0);
  const [selectedMeasure,    setSelectedMeasure]    = useState(0);
  const [selectedNoteIdx,    setSelectedNoteIdx]    = useState(null);
  const [zoom,               setZoom]               = useState(1);
  const [isPlaying,          setIsPlaying]          = useState(false);
  const [notification,       setNotification]       = useState(null);
  const [showSetupModal,     setShowSetupModal]     = useState(!score.initialized);

  // ── Audio ───────────────────────────────────────────────────────────
  const audio = useAudio();

  // ── Notification helper ───────────────────────────────────────────────────
  function notify(msg, type = "info") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  // ── Add note (shared by keyboard + MIDI) ─────────────────────────────────
  const handleAddNote = useCallback((noteInfo) => {
    const note = {
      ...noteInfo,
      accidental: noteInfo.accidental ?? selectedAccidental,
      duration:   selectedDuration,
      dotted:     isDotted,
      isRest:     inputMode === "rest",
      id:         Date.now() + Math.random(),
    };

    const { nextMeasure, nextNoteIdx } = score.addNote({
      partIdx:      selectedPart,
      measureIdx:   selectedMeasure,
      afterNoteIdx: selectedNoteIdx,
      note,
    });

    setSelectedMeasure(nextMeasure);
    setSelectedNoteIdx(nextNoteIdx);

    // Preview sound
    audio.previewNote(note, score.parts[selectedPart]?.instrument, score.tempo);
  }, [selectedDuration, selectedAccidental, inputMode, isDotted,
      selectedPart, selectedMeasure, selectedNoteIdx, score, audio]);

  // ── MIDI ───────────────────────────────────────────────────────────
  const midi = useMIDI({ onNoteOn: handleAddNote });

  async function connectMIDI() {
    const err = await midi.connect();
    if (err) notify("MIDI lỗi: " + err, "error");
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      const key = e.key;

      // Duration: keys 1–5  (5 maps to 16th)
      const durationKeys = { "1": "1", "2": "2", "3": "4", "4": "8", "5": "16" };
      if (durationKeys[key]) { setSelectedDuration(durationKeys[key]); return; }

      // Modifiers
      if (key === "r" || key === "R") { setInputMode(m => m === "rest" ? "note" : "rest"); return; }
      if (key === ".")                { setIsDotted(d => !d); return; }

      // Play/stop
      if (key === " ") { e.preventDefault(); togglePlay(); return; }

      // Navigation
      if (key === "ArrowLeft")  { navigate(-1); return; }
      if (key === "ArrowRight") { navigate(1);  return; }

      // Delete
      if (key === "Delete" || key === "Backspace") {
        if (selectedNoteIdx !== null) {
          score.deleteNote({ partIdx: selectedPart, measureIdx: selectedMeasure, noteIdx: selectedNoteIdx });
          setSelectedNoteIdx(n => (n > 0 ? n - 1 : null));
        }
        return;
      }

      // Note input (a–j, shift for octave 5)
      const lowerKey = key.toLowerCase();
      if (KEY_NOTE_MAP[lowerKey]) {
        const octave = e.shiftKey ? 5 : 4;
        handleAddNote({ key: KEY_NOTE_MAP[lowerKey], octave });
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAddNote, selectedPart, selectedMeasure, selectedNoteIdx, isPlaying]);

  function navigate(dir) {
    const measures = score.parts[selectedPart]?.measures ?? [];
    const notes    = measures[selectedMeasure]?.notes ?? [];

    if (selectedNoteIdx === null) {
      setSelectedNoteIdx(dir > 0 ? 0 : notes.length - 1);
      return;
    }
    const next = selectedNoteIdx + dir;
    if (next >= 0 && next < notes.length) {
      setSelectedNoteIdx(next);
    } else if (next < 0 && selectedMeasure > 0) {
      const prevNotes = measures[selectedMeasure - 1]?.notes ?? [];
      setSelectedMeasure(m => m - 1);
      setSelectedNoteIdx(prevNotes.length - 1);
    } else if (next >= notes.length && selectedMeasure < measures.length - 1) {
      setSelectedMeasure(m => m + 1);
      setSelectedNoteIdx(0);
    }
  }

  // ── Playback ──────────────────────────────────────────────────────────
  function togglePlay() {
    if (isPlaying) {
      audio.stopScore();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audio.playScore(score.parts, score.tempo, () => setIsPlaying(false));
    }
  }

  // ── Setup Modal handlers ────────────────────────────────────────────────────
  function handleSetupConfirm(config) {
    score.initializeScore(config);
    setShowSetupModal(false);
    notify("Tạo bản nhạc thành công!", "success");
  }

  // ── Notification colors ───────────────────────────────────────────────────
  const notifColors = {
    success: { bg: "#dcfce7", color: "#166534" },
    error:   { bg: "#fee2e2", color: "#991b1b" },
    info:    { bg: "#dbeafe", color: "#1e40af" },
  };

  // ── Empty state (before initialization) ──────────────────────────────────
  if (!score.initialized) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <SetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onConfirm={handleSetupConfirm}
        />

        {!showSetupModal && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              onClick={() => setShowSetupModal(true)}
              style={{
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 600,
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
              }}
            >
              + Tạo bản nhạc mới
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Toast notification */}
      {notification && (() => {
        const c = notifColors[notification.type] ?? notifColors.info;
        return (
          <div style={{
            position: "fixed", top: 16, right: 16, zIndex: 9999,
            padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            background: c.bg, color: c.color, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
            {notification.msg}
          </div>
        );
      })()}

      {/* ── Header ─────────────────────────────────────────────────────────*/}
      <Header
        title={score.title}       setTitle={score.setTitle}
        composer={score.composer} setComposer={score.setComposer}
        tempo={score.tempo}       setTempo={score.setTempo}
        isPlaying={isPlaying}     onTogglePlay={togglePlay}
        onExportMusicXML={() => {
          downloadMusicXML(score.parts, score.title, score.composer);
          notify("Đã xuất MusicXML! Mở bằng MuseScore để xem.", "success");
        }}
        onPrint={() => window.print()}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left toolbar ───────────────────────────────────────────────── */}
        <Toolbar
          selectedDuration={selectedDuration}     setSelectedDuration={setSelectedDuration}
          selectedAccidental={selectedAccidental} setSelectedAccidental={setSelectedAccidental}
          inputMode={inputMode}   setInputMode={setInputMode}
          isDotted={isDotted}     setIsDotted={setIsDotted}
          midiStatus={midi.status}
          onConnectMIDI={connectMIDI}
        />

        {/* ── Score canvas ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Part tabs + zoom */}
          <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {score.parts.map((p, i) => (
              !p.isGrouped && (
                <button key={p.id} onClick={() => setSelectedPart(i)} style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                  border: selectedPart === i ? "none" : "1px solid #e5e7eb",
                  background: selectedPart === i ? "#7c3aed" : "white",
                  color: selectedPart === i ? "white" : "#374151",
                  fontWeight: selectedPart === i ? 600 : 400,
                }}>
                  {p.name}
                </button>
              )
            ))}

            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={score.addMeasure} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>
                + Ô nhịp
              </button>
              <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                style={{ width: 28, height: 28, border: "1px solid #e5e7eb", background: "white", borderRadius: 4, cursor: "pointer", fontSize: 16 }}>−</button>
              <span style={{ fontSize: 12, color: "#6b7280", minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
                style={{ width: 28, height: 28, border: "1px solid #e5e7eb", background: "white", borderRadius: 4, cursor: "pointer", fontSize: 16 }}>+</button>
            </div>
          </div>

          {/* Score sheet */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px 32px", background: "#f1f5f9" }} id="score-area">
            <div style={{ background: "white", borderRadius: 8, padding: "36px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", minWidth: 820 }}>

              {/* Title block */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif" }}>
                  {score.title || "Untitled Score"}
                </div>
                {score.composer && (
                  <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{score.composer}</div>
                )}
              </div>

              {/* System groups (Voice + Piano pair with bracket) */}
              {score.parts && score.parts.length >= 2 && (() => {
                const systems = [];
                let partIdx = 0;
                
                while (partIdx < score.parts.length) {
                  const voicePart = score.parts[partIdx];
                  
                  // Check if this is a Voice part (not grouped)
                  const hasVoice = voicePart && !voicePart.isGrouped && voicePart.name === "Voice";
                  
                  systems.push(
                    <div key={`system-${partIdx}`} style={{ marginBottom: 56 }}>
                      {/* Voice staff (if present) */}
                      {hasVoice && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 32 }} 
                          onClick={() => setSelectedPart(partIdx)}>
                          <div style={{
                            width: 88, fontSize: 11, fontWeight: 600, paddingTop: 48, textAlign: "right", flexShrink: 0,
                            color: selectedPart === partIdx ? "#7c3aed" : "#9ca3af",
                          }}>
                            {voicePart.name}
                          </div>
                          <div style={{ flex: 1, overflowX: "auto", position: "relative" }}>
                            <Staff
                              part={voicePart}
                              selectedMeasure={selectedPart === partIdx ? selectedMeasure : -1}
                              selectedNoteIdx={selectedPart === partIdx ? selectedNoteIdx : -1}
                              onNoteClick={(mi, ni) => { setSelectedPart(partIdx); setSelectedMeasure(mi); setSelectedNoteIdx(ni); }}
                              onMeasureClick={(mi) => { setSelectedPart(partIdx); setSelectedMeasure(mi); setSelectedNoteIdx(null); }}
                              zoom={zoom}
                            />
                          </div>
                        </div>
                      )}
                      
                      partIdx += hasVoice ? 1 : 0;

                      {/* Piano staves (grouped with bracket) */}
                      {partIdx < score.parts.length && score.parts[partIdx] && score.parts[partIdx].isGrouped && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, position: "relative" }}>
                          <div style={{ width: 88, flexShrink: 0 }}></div>
                          <div style={{ flex: 1, position: "relative" }}>
                            {/* Piano bracket */}
                            <svg 
                              width="20" 
                              height="164" 
                              style={{ 
                                position: "absolute", 
                                left: "-12px", 
                                top: "-8px",
                                zIndex: 10
                              }}
                              viewBox="0 0 20 164"
                            >
                              {/* Vertical line */}
                              <line x1="14" y1="8" x2="14" y2="156" stroke="#1a1a1a" strokeWidth="2.5" />
                              {/* Top hook */}
                              <line x1="6" y1="8" x2="14" y2="8" stroke="#1a1a1a" strokeWidth="2.5" />
                              {/* Bottom hook */}
                              <line x1="6" y1="156" x2="14" y2="156" stroke="#1a1a1a" strokeWidth="2.5" />
                              {/* Curve at top */}
                              <path d="M 6 8 Q 2 40 6 72" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
                              {/* Curve at bottom */}
                              <path d="M 6 92 Q 2 124 6 156" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>

                            {/* Piano RH (Treble) */}
                            <div style={{ marginBottom: 20 }} onClick={() => setSelectedPart(partIdx)}>
                              <Staff
                                part={score.parts[partIdx]}
                                selectedMeasure={selectedPart === partIdx ? selectedMeasure : -1}
                                selectedNoteIdx={selectedPart === partIdx ? selectedNoteIdx : -1}
                                onNoteClick={(mi, ni) => { setSelectedPart(partIdx); setSelectedMeasure(mi); setSelectedNoteIdx(ni); }}
                                onMeasureClick={(mi) => { setSelectedPart(partIdx); setSelectedMeasure(mi); setSelectedNoteIdx(null); }}
                                zoom={zoom}
                              />
                            </div>

                            {/* Piano LH (Bass) */}
                            <div onClick={() => setSelectedPart(partIdx + 1)}>
                              <Staff
                                part={score.parts[partIdx + 1]}
                                selectedMeasure={selectedPart === (partIdx + 1) ? selectedMeasure : -1}
                                selectedNoteIdx={selectedPart === (partIdx + 1) ? selectedNoteIdx : -1}
                                onNoteClick={(mi, ni) => { setSelectedPart(partIdx + 1); setSelectedMeasure(mi); setSelectedNoteIdx(ni); }}
                                onMeasureClick={(mi) => { setSelectedPart(partIdx + 1); setSelectedMeasure(mi); setSelectedNoteIdx(null); }}
                                zoom={zoom}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      partIdx += 2;
                    </div>
                  );
                }
                return systems;
              })()}
            </div>
          </div>

          {/* Part settings bar */}
          <PartSettings
            parts={score.parts}
            selectedPart={selectedPart}
            onUpdatePart={score.updatePart}
            onAddPart={score.addPart}
            onRemovePart={(idx) => {
              if (score.parts.length <= 1) { notify("Cần ít nhất 1 bè!", "error"); return; }
              score.removePart(idx);
              if (selectedPart >= idx) setSelectedPart(Math.max(0, selectedPart - 1));
            }}
          />
        </div>
      </div>

      <style>{`
        :root { --ink: #1a1a1a; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @media print {
          header, aside, [style*="borderBottom"], [style*="borderTop"] { display: none !important; }
          #score-area { padding: 0 !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}
