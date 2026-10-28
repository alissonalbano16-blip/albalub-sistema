// Mostra a transcrição de um projeto Remotion para planejar a edição.
// Uso: node frases.js <projeto> [--palavras]
//  - padrão: uma frase por linha com o tempo de início (s)
//  - --palavras: cada frase seguida das palavras com o tempo exato (para sincronizar motions)
const path = require("path");

const [nome, flag] = process.argv.slice(2);
if (!nome) {
  console.error("Uso: node frases.js <projeto> [--palavras]");
  process.exit(1);
}
const captions = require(path.join(__dirname, "remotion", "public", nome, "captions.json"));

let atual = [];
const fechar = () => {
  if (!atual.length) return;
  const ini = (atual[0].startMs / 1000).toFixed(2);
  const fim = (atual[atual.length - 1].endMs / 1000).toFixed(2);
  console.log(`[${ini}–${fim}] ${atual.map((w) => w.text.trim()).join(" ")}`);
  if (flag === "--palavras") {
    console.log("   " + atual.map((w) => `${(w.startMs / 1000).toFixed(2)} ${w.text.trim()}`).join(" | "));
  }
  atual = [];
};
for (const w of captions) {
  atual.push(w);
  if (/[.!?…]$/.test(w.text.trim())) fechar();
}
fechar();
