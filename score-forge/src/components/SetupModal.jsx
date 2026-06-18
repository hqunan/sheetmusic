import { useState } from "react";

const KEY_SIGNATURES = [
  { name: "C major / A minor", sharps: 0 },
  { name: "G major / E minor", sharps: 1 },
  { name: "D major / B minor", sharps: 2 },
  { name: "A major / F# minor", sharps: 3 },
  { name: "E major / C# minor", sharps: 4 },
  { name: "B major / G# minor", sharps: 5 },
  { name: "F# major / D# minor", sharps: 6 },
  { name: "C# major / A# minor", sharps: 7 },
  { name: "F major / D minor", sharps: -1 },
  { name: "Bb major / G minor", sharps: -2 },
  { name: "Eb major / C minor", sharps: -3 },
  { name: "Ab major / F minor", sharps: -4 },
  { name: "Db major / Bb minor", sharps: -5 },
  { name: "Gb major / Eb minor", sharps: -6 },
  { name: "Cb major / Ab minor", sharps: -7 },
];

const TIME_SIGNATURES = ["2/4", "3/4", "4/4", "6/8", "3/8"];

export default function SetupModal({ isOpen, onClose, onConfirm }) {
  const [tempo, setTempo] = useState(80);
  const [measures, setMeasures] = useState(4);
  const [keySignature, setKeySignature] = useState(0);
  const [timeSignature, setTimeSignature] = useState("4/4");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      tempo,
      measures,
      keySignature: KEY_SIGNATURES[keySignature],
      timeSignature,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 32,
          maxWidth: 600,
          width: "90%",
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
          Fine-tune the setup of abc
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          {/* Tempo */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Tempo
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>♪</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                style={{
                  width: 60,
                  padding: 6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
              <button
                onClick={() => setTempo((t) => Math.max(1, t - 1))}
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              >
                −
              </button>
              <button
                onClick={() => setTempo((t) => Math.min(300, t + 1))}
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Measures */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Measures
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                value={measures}
                onChange={(e) => setMeasures(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 60,
                  padding: 6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
              <button
                onClick={() => setMeasures((m) => Math.max(1, m - 1))}
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              >
                −
              </button>
              <button
                onClick={() => setMeasures((m) => m + 1)}
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Key Signature */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
            Key signature
          </label>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px 0" }}>
            Starts with no sharps or flats by default.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {KEY_SIGNATURES.map((ks, idx) => (
              <button
                key={idx}
                onClick={() => setKeySignature(idx)}
                style={{
                  padding: 8,
                  border: keySignature === idx ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                  background: keySignature === idx ? "#eff6ff" : "white",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                  color: keySignature === idx ? "#3b82f6" : "#374151",
                  fontWeight: keySignature === idx ? 600 : 400,
                }}
              >
                {ks.name}
              </button>
            ))}
          </div>
        </div>

        {/* Time Signature */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
            Time signature
          </label>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px 0" }}>
            Select an option or customize
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                onClick={() => setTimeSignature(ts)}
                style={{
                  padding: 12,
                  border: timeSignature === ts ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                  background: timeSignature === ts ? "#eff6ff" : "white",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: timeSignature === ts ? 600 : 400,
                  color: timeSignature === ts ? "#3b82f6" : "#374151",
                }}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 24px",
              border: "none",
              background: "#3b82f6",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
            }}
          >
            Create Score
          </button>
        </div>
      </div>
    </div>
  );
}
