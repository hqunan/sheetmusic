import { CLEFS, INSTRUMENTS, TIME_SIGNATURES } from "../utils/constants";

export default function PartSettings({ parts, selectedPart, onUpdatePart, onAddPart, onRemovePart }) {
  const part = parts[selectedPart];
  if (!part) return null;

  const labelStyle = { fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 };
  const inputStyle = {
    padding: "3px 8px", border: "1px solid #e5e7eb", borderRadius: 4,
    fontSize: 12, background: "white", color: "#1a1a1a",
  };

  return (
    <div style={{
      background: "white", borderTop: "1px solid #e5e7eb",
      padding: "8px 16px", display: "flex", alignItems: "center",
      gap: 14, flexWrap: "wrap", flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Bè:</span>

      <label style={labelStyle}>
        Tên
        <input
          value={part.name}
          onChange={e => onUpdatePart(selectedPart, "name", e.target.value)}
          style={{ ...inputStyle, width: 110 }}
        />
      </label>

      <label style={labelStyle}>
        Khóa
        <select value={part.clef} onChange={e => onUpdatePart(selectedPart, "clef", e.target.value)} style={inputStyle}>
          {CLEFS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Nhạc cụ
        <select value={part.instrument} onChange={e => onUpdatePart(selectedPart, "instrument", e.target.value)} style={inputStyle}>
          {INSTRUMENTS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </label>

      <label style={labelStyle}>
        Nhịp
        <select value={part.timeSig} onChange={e => onUpdatePart(selectedPart, "timeSig", e.target.value)} style={inputStyle}>
          {TIME_SIGNATURES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button onClick={onAddPart} style={{
          padding: "4px 12px", background: "#7c3aed", color: "white",
          border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600,
        }}>
          + Thêm bè
        </button>
        <button onClick={() => onRemovePart(selectedPart)} style={{
          padding: "4px 12px", background: "#fee2e2", color: "#dc2626",
          border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", fontSize: 12,
        }}>
          🗑 Xóa bè
        </button>
      </div>
    </div>
  );
}
