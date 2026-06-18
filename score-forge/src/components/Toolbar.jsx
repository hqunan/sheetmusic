import { DURATION_MAP } from "../utils/constants";

export default function Toolbar({
  selectedDuration, setSelectedDuration,
  selectedAccidental, setSelectedAccidental,
  inputMode, setInputMode,
  isDotted, setIsDotted,
  midiStatus, onConnectMIDI,
}) {
  const sidebarBg = "#1e1e2e";
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6,
  };
  const btnBase = {
    display: "block", width: "100%", textAlign: "left",
    padding: "5px 8px", border: "none", borderRadius: 4,
    cursor: "pointer", fontSize: 13, marginBottom: 2, transition: "background 0.1s",
  };

  function Item({ active, onClick, children }) {
    return (
      <button
        style={{ ...btnBase, background: active ? "#7c3aed" : "transparent", color: active ? "white" : "#d1d5db" }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  function OutlineBtn({ active, onClick, children }) {
    return (
      <button onClick={onClick} style={{
        ...btnBase, marginBottom: 4,
        background: active ? "#7c3aed" : "transparent",
        color: active ? "white" : "#d1d5db",
        border: `1px solid ${active ? "#7c3aed" : "#374151"}`,
      }}>
        {children}
      </button>
    );
  }

  const midiColors = {
    connected:     { bg: "#14532d", color: "#86efac" },
    connecting:    { bg: "#374151", color: "#d1d5db" },
    error:         { bg: "#450a0a", color: "#fca5a5" },
    not_requested: { bg: "#374151", color: "#d1d5db" },
  };
  const midi = midiColors[midiStatus];

  return (
    <aside style={{
      width: 196, background: sidebarBg, color: "white",
      padding: "14px 10px", display: "flex", flexDirection: "column",
      gap: 16, flexShrink: 0, overflowY: "auto",
    }}>

      {/* Duration */}
      <section>
        <div style={labelStyle}>Trường độ</div>
        {Object.entries(DURATION_MAP).map(([k, v]) => (
          <Item key={k} active={selectedDuration === k} onClick={() => setSelectedDuration(k)}>
            <span style={{ marginRight: 8, fontSize: 15 }}>{v.symbol}</span>
            {v.label}
            <span style={{ marginLeft: 6, color: "#6b7280", fontSize: 11 }}>({k})</span>
          </Item>
        ))}
      </section>

      {/* Modifiers */}
      <section>
        <div style={labelStyle}>Kiểu nốt</div>
        <OutlineBtn active={inputMode === "rest"} onClick={() => setInputMode(m => m === "rest" ? "note" : "rest")}>
          𝄽 Dấu nghỉ <span style={{ color: "#6b7280", fontSize: 11 }}>(R)</span>
        </OutlineBtn>
        <OutlineBtn active={isDotted} onClick={() => setIsDotted(d => !d)}>
          • Chấm đôi <span style={{ color: "#6b7280", fontSize: 11 }}>(.</span>)
        </OutlineBtn>
      </section>

      {/* Accidentals */}
      <section>
        <div style={labelStyle}>Dấu hóa</div>
        {[
          ["sharp",   "♯ Thăng"],
          ["flat",    "♭ Giáng"],
          ["natural", "♮ Bình"],
          [null,      "✕ Không có"],
        ].map(([k, label]) => (
          <Item key={String(k)} active={selectedAccidental === k} onClick={() => setSelectedAccidental(k)}>
            {label}
          </Item>
        ))}
      </section>

      {/* MIDI */}
      <section>
        <div style={labelStyle}>MIDI Piano</div>
        <button
          disabled={midiStatus === "connected" || midiStatus === "connecting"}
          onClick={onConnectMIDI}
          style={{
            display: "block", width: "100%", padding: "7px 8px",
            background: midi.bg, color: midi.color,
            border: "none", borderRadius: 4, cursor: midiStatus === "connected" ? "default" : "pointer",
            fontSize: 12, fontWeight: 600,
          }}
        >
          {midiStatus === "connected"     && "✓ MIDI đã kết nối"}
          {midiStatus === "connecting"    && "Đang kết nối…"}
          {midiStatus === "error"         && "⚠ Lỗi — thử lại"}
          {midiStatus === "not_requested" && "🔌 Kết nối MIDI"}
        </button>
        {midiStatus === "error" && (
          <p style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>
            Trình duyệt cần dùng Chrome/Edge và kết nối qua HTTPS.
          </p>
        )}
      </section>

      {/* Keyboard shortcuts */}
      <section style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid #374151" }}>
        <div style={labelStyle}>Phím tắt</div>
        {[
          ["A – J",   "Nốt C – B"],
          ["Shift+…", "Octave cao"],
          ["1 – 5",   "Trường độ"],
          ["R",       "Dấu nghỉ"],
          [".",       "Chấm đôi"],
          ["Del",     "Xóa nốt"],
          ["← →",    "Di chuyển"],
          ["Space",   "Play/Stop"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, gap: 6 }}>
            <span style={{ background: "#374151", padding: "1px 5px", borderRadius: 3, color: "#e5e7eb", fontFamily: "monospace", whiteSpace: "nowrap" }}>{k}</span>
            <span style={{ color: "#9ca3af", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </section>
    </aside>
  );
}
