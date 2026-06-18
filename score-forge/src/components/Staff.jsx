import { STAFF, DURATION_MAP } from "../utils/constants";
import { pitchToY, getLedgerLines, stemUp, noteSpacing } from "../utils/musicUtils";

const { TOP_Y, LINE_GAP, CLEF_W, TIMESIG_W, BAR_W, BAR_GAP, NOTE_RX, NOTE_RY, STEM_LEN } = STAFF;
const BOTTOM_Y = TOP_Y + LINE_GAP * 4;

// ── Sub-components ────────────────────────────────────────────────────────

function StaffLines({ totalWidth }) {
  return [0, 1, 2, 3, 4].map(i => (
    <line key={i} x1={8} y1={TOP_Y + i * LINE_GAP}
      x2={totalWidth - 8} y2={TOP_Y + i * LINE_GAP}
      stroke="var(--ink)" strokeWidth={1} />
  ));
}

function Clef({ clef }) {
  return clef === "treble"
    ? <text x={12} y={BOTTOM_Y + 8} fontSize={52} fontFamily="serif" fill="var(--ink)" style={{ userSelect: "none" }}>𝄞</text>
    : <text x={14} y={TOP_Y + 22} fontSize={30} fontFamily="serif" fill="var(--ink)" style={{ userSelect: "none" }}>𝄢</text>;
}

function TimeSig({ timeSig }) {
  const [beats, val] = (timeSig || "4/4").split("/");
  return <>
    <text x={CLEF_W + 6} y={TOP_Y + 20} fontSize={18} fontWeight="bold" fontFamily="serif" fill="var(--ink)">{beats}</text>
    <text x={CLEF_W + 6} y={TOP_Y + 40} fontSize={18} fontWeight="bold" fontFamily="serif" fill="var(--ink)">{val}</text>
  </>;
}

function NoteHead({ x, y, duration, color, dotted }) {
  const filled = ["4", "8", "16"].includes(duration);
  const up = stemUp(y);
  const stemX = up ? x + NOTE_RX - 1 : x - NOTE_RX + 1;
  const stemY2 = up ? y - STEM_LEN : y + STEM_LEN;

  return (
    <g>
      {/* Oval head */}
      <ellipse cx={x} cy={y} rx={NOTE_RX} ry={NOTE_RY}
        fill={filled ? color : "white"} stroke={color} strokeWidth={1.5}
        transform={`rotate(-18, ${x}, ${y})`} />

      {/* Stem */}
      {duration !== "1" && (
        <line x1={stemX} y1={y} x2={stemX} y2={stemY2} stroke={color} strokeWidth={1.5} />
      )}

      {/* Flag(s) */}
      {(duration === "8" || duration === "16") && (
        <path d={up
          ? `M${stemX},${stemY2} Q${stemX + 14},${stemY2 + 8} ${stemX + 8},${stemY2 + 22}`
          : `M${stemX},${stemY2} Q${stemX + 14},${stemY2 - 8} ${stemX + 8},${stemY2 - 22}`
        } fill="none" stroke={color} strokeWidth={1.5} />
      )}
      {duration === "16" && (
        <path d={up
          ? `M${stemX},${stemY2 + 9} Q${stemX + 14},${stemY2 + 17} ${stemX + 8},${stemY2 + 31}`
          : `M${stemX},${stemY2 - 9} Q${stemX + 14},${stemY2 - 17} ${stemX + 8},${stemY2 - 31}`
        } fill="none" stroke={color} strokeWidth={1.5} />
      )}

      {/* Dot */}
      {dotted && <circle cx={x + NOTE_RX + 4} cy={y - 2} r={2} fill={color} />}
    </g>
  );
}

function RestSymbol({ x, duration, color }) {
  const midY = TOP_Y + LINE_GAP * 2;
  switch (duration) {
    case "1":  return <rect x={x - 8} y={midY - LINE_GAP} width={16} height={LINE_GAP * 0.6} fill={color} />;
    case "2":  return <rect x={x - 8} y={midY} width={16} height={LINE_GAP * 0.6} fill={color} />;
    case "4":  return <text x={x} y={midY + 6} textAnchor="middle" fontSize={20} fill={color} style={{ userSelect: "none" }}>𝄽</text>;
    case "8":  return <text x={x} y={midY + 6} textAnchor="middle" fontSize={16} fill={color} style={{ userSelect: "none" }}>𝄾</text>;
    case "16": return <text x={x} y={midY + 6} textAnchor="middle" fontSize={14} fill={color} style={{ userSelect: "none" }}>𝄿</text>;
    default:   return <text x={x} y={midY + 6} textAnchor="middle" fontSize={20} fill={color} style={{ userSelect: "none" }}>𝄽</text>;
  }
}

function AccidentalSymbol({ x, y, type }) {
  const symbols = { sharp: "♯", flat: "♭", natural: "♮" };
  if (!symbols[type]) return null;
  return <text x={x - 14} y={y + 4} fontSize={12} fill="var(--ink)" style={{ userSelect: "none" }}>{symbols[type]}</text>;
}

// ── Main component ────────────────────────────────────────────────────────

export default function Staff({
  part,
  selectedMeasure,
  selectedNoteIdx,
  onNoteClick,
  onMeasureClick,
  zoom = 1,
}) {
  const measures = part.measures;
  const totalW = CLEF_W + TIMESIG_W + measures.length * (BAR_W + BAR_GAP) + 20;
  const svgH = STAFF.SVG_HEIGHT;

  return (
    <svg
      width={totalW * zoom}
      height={svgH * zoom}
      viewBox={`0 0 ${totalW} ${svgH}`}
      style={{ display: "block", minWidth: totalW * zoom, cursor: "default" }}
    >
      <StaffLines totalWidth={totalW} />
      <Clef clef={part.clef} />
      <TimeSig timeSig={part.timeSig} />

      {/* Opening bar line */}
      <line x1={CLEF_W + TIMESIG_W} y1={TOP_Y} x2={CLEF_W + TIMESIG_W} y2={BOTTOM_Y} stroke="var(--ink)" strokeWidth={1.5} />

      {measures.map((measure, mi) => {
        const mX = CLEF_W + TIMESIG_W + mi * (BAR_W + BAR_GAP);
        const isSelMeasure = selectedMeasure === mi;
        const spacing = noteSpacing(measure.notes.length);

        return (
          <g key={mi} onClick={(e) => { e.stopPropagation(); onMeasureClick(mi); }} style={{ cursor: "pointer" }}>

            {/* Selection highlight */}
            {isSelMeasure && (
              <rect x={mX} y={TOP_Y - 6} width={BAR_W} height={LINE_GAP * 4 + 12}
                fill="#eff6ff" stroke="#3b82f6" strokeWidth={1} rx={3} />
            )}

            {/* Measure number */}
            <text x={mX + 2} y={TOP_Y - 9} fontSize={9} fill="#aaa">{mi + 1}</text>

            {/* Bar line */}
            <line x1={mX + BAR_W} y1={TOP_Y} x2={mX + BAR_W} y2={BOTTOM_Y} stroke="var(--ink)" strokeWidth={1.5} />

            {/* Notes */}
            {measure.notes.map((note, ni) => {
              const nx = mX + 16 + ni * spacing;
              const isSelNote = isSelMeasure && selectedNoteIdx === ni;
              const color = isSelNote ? "#3b82f6" : "var(--ink)";

              if (note.isRest) {
                return (
                  <g key={ni} onClick={(e) => { e.stopPropagation(); onNoteClick(mi, ni); }}
                    style={{ cursor: "pointer" }}>
                    {isSelNote && <circle cx={nx} cy={TOP_Y + LINE_GAP * 2} r={14} fill="#dbeafe" />}
                    <RestSymbol x={nx} duration={note.duration} color={color} />
                  </g>
                );
              }

              const ny = pitchToY(note.key, note.octave, part.clef);
              const ledgers = getLedgerLines(ny);

              return (
                <g key={ni} onClick={(e) => { e.stopPropagation(); onNoteClick(mi, ni); }}
                  style={{ cursor: "pointer" }}>
                  {isSelNote && <circle cx={nx} cy={ny} r={14} fill="#dbeafe" />}

                  {/* Ledger lines */}
                  {ledgers.map(ly => (
                    <line key={ly} x1={nx - 10} y1={ly} x2={nx + 10} y2={ly} stroke="var(--ink)" strokeWidth={1} />
                  ))}

                  <AccidentalSymbol x={nx} y={ny} type={note.accidental} />
                  <NoteHead x={nx} y={ny} duration={note.duration} color={color} dotted={note.dotted} />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Final double bar */}
      <line x1={totalW - 12} y1={TOP_Y} x2={totalW - 12} y2={BOTTOM_Y} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={totalW - 7}  y1={TOP_Y} x2={totalW - 7}  y2={BOTTOM_Y} stroke="var(--ink)" strokeWidth={4} />
    </svg>
  );
}
