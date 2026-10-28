// Prepara um vídeo cortado + transcrição para o projeto Remotion.
// Uso: node preparar_remotion.js <video-cortado.mp4> <transcricao.json> <nome-projeto>
// Copia para remotion/public/<nome>/ (video.mp4, captions.json) e limpa a transcrição:
//  - junta "R" + "$" em "R$"
//  - remove palavra repetida em sequência ("Dois, dois," -> "Dois,")
const fs = require("fs");
const path = require("path");

const [video, transcricao, nome] = process.argv.slice(2);
if (!nome) {
  console.error("Uso: node preparar_remotion.js <video.mp4> <transcricao.json> <nome>");
  process.exit(1);
}

const destino = path.join(__dirname, "remotion", "public", nome);
fs.mkdirSync(destino, { recursive: true });

const palavras = JSON.parse(fs.readFileSync(transcricao, "utf8"));
const limpa = (t) => t.trim().toLowerCase().replace(/[.,!?…]/g, "");
const saida = [];
for (const p of palavras) {
  const ant = saida[saida.length - 1];
  if (ant && limpa(ant.text) === "r" && p.text.trim() === "$") {
    ant.text = " R$";
    ant.endMs = p.endMs;
    continue;
  }
  if (ant && ant.text.trim() === "R$") {
    // "R$" gruda no número seguinte: "R$ 30"
    ant.text = " R$" + p.text;
    ant.endMs = p.endMs;
    continue;
  }
  if (ant && limpa(ant.text) === limpa(p.text) && limpa(p.text) !== "") {
    ant.endMs = p.endMs;
    continue;
  }
  saida.push({ ...p });
}

fs.writeFileSync(path.join(destino, "captions.json"), JSON.stringify(saida, null, 1));
fs.copyFileSync(video, path.join(destino, "video.mp4"));
console.log(`OK: ${palavras.length} -> ${saida.length} palavras em ${destino}`);

// Esqueleto do config.json (não sobrescreve um existente)
const config = path.join(destino, "config.json");
if (!fs.existsSync(config)) {
  const { execFileSync } = require("child_process");
  const dur = parseFloat(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString(),
  );
  fs.writeFileSync(
    config,
    JSON.stringify(
      { video: `${nome}/video.mp4`, captions: `${nome}/captions.json`, durationSec: Math.round(dur * 100) / 100, overlays: [], scenes: [] },
      null,
      2,
    ),
  );
  console.log(`config.json criado (${dur.toFixed(2)}s)`);
}
