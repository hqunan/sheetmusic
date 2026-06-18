import { DURATION_MAP } from "./constants";

const DURATION_TYPE = {
  "1": "whole", "2": "half", "4": "quarter", "8": "eighth", "16": "16th",
};

export function exportMusicXML(parts, title, composer) {
  const partListXML = parts.map((p, i) =>
    `    <score-part id="P${i + 1}"><part-name>${p.name}</part-name></score-part>`
  ).join("\n");

  const partsXML = parts.map((p, pi) => {
    const measuresXML = p.measures.map((m, mi) => {
      const attributesXML = mi === 0 ? `
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time>
          <beats>${p.timeSig.split("/")[0]}</beats>
          <beat-type>${p.timeSig.split("/")[1]}</beat-type>
        </time>
        <clef>
          <sign>${p.clef === "treble" ? "G" : "F"}</sign>
          <line>${p.clef === "treble" ? "2" : "4"}</line>
        </clef>
      </attributes>` : "";

      const notesXML = m.notes.map(n => {
        const beats = (DURATION_MAP[n.duration]?.beats ?? 1) * (n.dotted ? 1.5 : 1);
        const alter = n.accidental === "sharp" ? "<alter>1</alter>" : n.accidental === "flat" ? "<alter>-1</alter>" : "";
        const pitchXML = n.isRest
          ? "<rest/>"
          : `<pitch><step>${n.key}</step>${alter}<octave>${n.octave}</octave></pitch>`;
        const dotXML = n.dotted ? "<dot/>" : "";
        return `      <note>
        ${pitchXML}
        <duration>${Math.round(beats * 4)}</duration>
        <type>${DURATION_TYPE[n.duration] ?? "quarter"}</type>
        ${dotXML}
      </note>`;
      }).join("\n");

      return `    <measure number="${mi + 1}">${attributesXML}\n${notesXML}\n    </measure>`;
    }).join("\n");

    return `  <part id="P${pi + 1}">\n${measuresXML}\n  </part>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN"
  "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${title}</work-title></work>
  <identification>
    <creator type="composer">${composer}</creator>
    <encoding><software>ScoreForge</software></encoding>
  </identification>
  <part-list>
${partListXML}
  </part-list>
${partsXML}
</score-partwise>`;
}

export function downloadMusicXML(parts, title, composer) {
  const xml = exportMusicXML(parts, title, composer);
  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title || "score"}.musicxml`;
  a.click();
  URL.revokeObjectURL(a.href);
}
