export default function Header({
  title, setTitle, composer, setComposer,
  tempo, setTempo,
  isPlaying, onTogglePlay,
  onExportMusicXML, onPrint,
}) {
  const btnStyle = (color) => ({
    background: color, color: "white", border: "none",
    borderRadius: 6, padding: "5px 13px", cursor: "pointer",
    fontSize: 13, fontWeight: 600,
  });

  return (
    <header style={{
      background: "#1e1e2e", color: "white",
      padding: "0 16px", display: "flex", alignItems: "center",
      gap: 14, height: 48, flexShrink: 0,
    }}>
      <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px", color: "#a78bfa", whiteSpace: "nowrap" }}>
        🎼 ScoreForge
      </span>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Tiêu đề bản nhạc…"
        style={{ background: "transparent", border: "none", color: "white", fontSize: 14, flex: 1, maxWidth: 280, outline: "none" }}
      />

      <input
        value={composer}
        onChange={e => setComposer(e.target.value)}
        placeholder="Nhạc sĩ…"
        style={{ background: "transparent", border: "none", color: "#a1a1aa", fontSize: 13, width: 140, outline: "none" }}
      />

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "#a1a1aa" }}>♩=</label>
        <input
          type="number" value={tempo} min={40} max={240}
          onChange={e => setTempo(Number(e.target.value))}
          style={{ width: 52, background: "#2d2d40", border: "1px solid #444", color: "white", borderRadius: 4, padding: "3px 6px", fontSize: 13 }}
        />

        <button onClick={onTogglePlay} style={btnStyle(isPlaying ? "#ef4444" : "#22c55e")}>
          {isPlaying ? "⏹ Stop" : "▶ Play"}
        </button>

        <button onClick={onExportMusicXML} style={btnStyle("#7c3aed")}>
          ⬇ MusicXML
        </button>

        <button onClick={onPrint} style={btnStyle("#374151")}>
          🖨 In
        </button>
      </div>
    </header>
  );
}
