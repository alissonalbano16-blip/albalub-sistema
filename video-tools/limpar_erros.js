// Limpa erros de gravação: frases repetidas, recomeços ("eu vendi... eu vendi 30 mil"),
// palavras duplicadas ("dois, dois"), vícios ("hum", "ahn") e, opcionalmente, pausas longas.
//
// 1) Detectar (lê a transcrição palavra a palavra do transcrever.py):
//    node limpar_erros.js detectar <video.json> [--pausas 1.0] [--idioma pt]
//    → imprime os candidatos e grava <video>.cortes.json
//      ("aplicar": true nos de certeza, false nos que precisam de revisão).
//    Revise o arquivo: troque "aplicar", ajuste "inicio"/"fim" ou adicione cortes manuais
//    { "inicio": 12.3, "fim": 14.1, "aplicar": true }.
//
// 2) Aplicar (corta o vídeo e reajusta a transcrição — não precisa transcrever de novo):
//    node limpar_erros.js aplicar <video.mp4> <video.json> [<video.cortes.json>] [--encoder libx264]
//    → <video> - limpo.mp4 (H.264, já serve para o Remotion) e <video> - limpo.json
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const args = process.argv.slice(2);
const opt = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : padrao;
};
const posicionais = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const [modo, ...resto] = posicionais;

const base = (arquivo) => arquivo.replace(/\.[^.\\/]+$/, "");
const norm = (t) =>
  t.toLowerCase().replace(/[^\p{L}\p{N}$]/gu, ""); // mantém acentos: "e" ≠ "é"
const s = (ms) => +(ms / 1000).toFixed(3);

// ---------------------------------------------------------------- detectar
const ENFASE = new Set(["muito", "não", "sim", "nunca", "sempre", "bem", "super", "mais", "já", "vai", "corre", "isso", "passo", "very", "no", "yes", "so", "never", "muy", "sí"]);
const VICIOS = {
  pt: ["hum", "hmm", "humm", "ahn", "aham", "han", "ham", "ee", "eee", "eh", "ehh", "tipo assim"],
  en: ["uh", "um", "uhm", "erm", "hmm", "ah"],
  es: ["eh", "ehh", "em", "este", "hmm"],
};
const MARCADORES = ["corta", "de novo", "denovo", "errei", "pera", "peraí", "perai", "vou repetir", "repete", "again", "cut", "let me redo"];

function detectar(jsonPath) {
  const palavras = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const idioma = opt("idioma", "pt");
  const pausaMax = opt("pausas") ? parseFloat(opt("pausas")) : null;
  // Índices das palavras "de verdade" (pontuação solta fica de fora)
  const w = palavras.map((p, i) => ({ ...p, i, n: norm(p.text) })).filter((p) => p.n);
  const N = w.length;
  const cand = [];
  const MAX_FALSO = 15; // palavras no take errado
  const MAX_SEG = 8000; // ms

  const fimFrase = (k) => /[.!?…]$/.test(w[k].text.trim());
  const virgula = (k) => /,$/.test(w[k].text.trim());
  const gap = (k) => (k > 0 ? w[k].startMs - w[k - 1].endMs : 0);
  // Trecho errado não atravessa fim de frase (a última palavra dele pode ter ponto)
  const semFimFrase = (a, b) => {
    for (let k = a; k < b - 1; k++) if (fimFrase(k)) return false;
    return true;
  };
  const prefixo = (a, b, max) => {
    let k = 0;
    while (k < max && b + k < N && w[a + k].n === w[b + k].n) k++;
    return k;
  };

  for (let i = 0; i < N; ) {
    // Procura o recomeço MAIS tardio (cobre várias tentativas seguidas); certeza vence revisão
    let certo = null;
    let duvida = null;
    for (let j = i + 1; j < Math.min(N, i + MAX_FALSO + 1); j++) {
      if (w[j].startMs - w[i].startMs > MAX_SEG) break;
      const m = j - i; // tamanho do trecho errado
      const k = prefixo(i, j, m); // quanto do trecho errado é repetido no take seguinte
      if (k === m && m === 1) {
        const enf = ENFASE.has(w[i].n);
        const c = { j, tipo: "palavra dupla", confianca: enf ? "revisar" : "certeza", ...(enf ? { nota: "pode ser ênfase" } : {}) };
        if (enf) duvida = c;
        else certo = c;
      } else if (k === m) {
        certo = { j, tipo: "repetição", confianca: "certeza" };
      } else if (k >= 2 && k >= m - 1 && semFimFrase(i, j)) {
        // "eu vendi trinta... eu vendi 30 mil": repete tudo menos a palavra em que travou.
        // Sem pausa de hesitação pode ser paralelismo intencional ("tem que ser X, tem que ser Y")
        if (gap(j) >= 250 || !virgula(j - 1)) certo = { j, tipo: "recomeço", confianca: "certeza" };
        else duvida = { j, tipo: "recomeço", confianca: "revisar", nota: "pode ser paralelismo (\"tem que ser X, tem que ser Y\")" };
      } else if (k >= 2 && k >= m - 2 && gap(j) >= 300 && semFimFrase(i, j)) {
        duvida = { j, tipo: "recomeço", confianca: "revisar" };
      } else if (m === 2 && k === 1 && (virgula(i + 1) || gap(j) >= 250) && semFimFrase(i, j + 1) && !duvida) {
        // "um pequeno, um simples": troca de palavra — mas listas ("um PDF, um vídeo") têm o mesmo formato
        duvida = { j, tipo: "correção", confianca: "revisar", nota: "pode ser uma lista (\"um X, um Y\")" };
      }
    }
    const melhor = certo || duvida;
    if (melhor) {
      cand.push({ a: i, b: melhor.j, ...melhor });
      i = melhor.j;
      continue;
    }
    i++;
  }

  // Vícios de linguagem
  const vicios = VICIOS[idioma] || VICIOS.pt;
  for (let i = 0; i < N; i++) {
    const um = w[i].n;
    const dois = i + 1 < N ? `${um} ${w[i + 1].n}` : "";
    if (vicios.includes(dois) && dois) cand.push({ a: i, b: i + 2, tipo: "vício", confianca: "revisar" });
    else if (vicios.includes(um)) cand.push({ a: i, b: i + 1, tipo: "vício", confianca: "revisar" });
  }

  // Marcadores falados ("corta", "de novo"...): só sinaliza, o corte é decidido lendo o contexto
  const marc = [];
  for (let i = 0; i < N; i++) {
    for (const mk of MARCADORES) {
      const partes = mk.split(" ").map(norm);
      if (partes.every((p, k) => i + k < N && w[i + k].n === p)) marc.push({ i, mk });
    }
  }

  const ctx = (a, b) => {
    const antes = w.slice(Math.max(0, a - 5), a).map((x) => x.text.trim()).join(" ");
    const meio = w.slice(a, b).map((x) => x.text.trim()).join(" ");
    const depois = w.slice(b, b + 6).map((x) => x.text.trim()).join(" ");
    return `…${antes} [${meio}] ${depois}…`;
  };

  // Limites do corte: tira o take errado + a pausa depois dele, mantendo a pausa natural antes
  const cortes = cand.map((c) => {
    const ini = w[c.a].startMs;
    const fimRuim = w[c.b - 1].endMs;
    const prevFim = c.a > 0 ? w[c.a - 1].endMs : 0;
    const proxIni = c.b < N ? w[c.b].startMs : fimRuim + 150;
    const inicio = ini - Math.min(100, Math.max(0, (ini - prevFim) / 2));
    const fim = proxIni - Math.min(100, Math.max(0, (proxIni - fimRuim) / 2));
    return {
      inicio: s(inicio),
      fim: s(fim),
      tipo: c.tipo,
      confianca: c.confianca,
      aplicar: c.confianca === "certeza",
      removido: w.slice(c.a, c.b).map((x) => x.text.trim()).join(" "),
      contexto: ctx(c.a, c.b),
      ...(c.nota ? { nota: c.nota } : {}),
    };
  });

  // Pausas longas (opcional): encurta para 0.3s
  if (pausaMax) {
    for (let k = 1; k < N; k++) {
      const gap = w[k].startMs - w[k - 1].endMs;
      if (gap > pausaMax * 1000) {
        cortes.push({
          inicio: s(w[k - 1].endMs + 150),
          fim: s(w[k].startMs - 150),
          tipo: "pausa",
          confianca: "certeza",
          aplicar: true,
          removido: `(${(gap / 1000).toFixed(1)}s de silêncio)`,
          contexto: ctx(k, k),
        });
      }
    }
  }

  cortes.sort((x, y) => x.inicio - y.inicio);
  const saida = base(jsonPath) + ".cortes.json";
  fs.writeFileSync(
    saida,
    JSON.stringify(
      { marcadores: marc.map((m) => ({ em: s(w[m.i].startMs), palavra: m.mk, contexto: ctx(m.i, m.i + m.mk.split(" ").length) })), cortes },
      null,
      1,
    ),
  );

  if (!cortes.length && !marc.length) console.log("Nenhum erro de gravação encontrado.");
  for (const c of cortes) {
    const marca = c.aplicar ? "✂ " : "? ";
    console.log(`${marca}${c.inicio.toFixed(2)}–${c.fim.toFixed(2)}  ${c.tipo.padEnd(13)} ${c.contexto}${c.nota ? `  (${c.nota})` : ""}`);
  }
  for (const m of marc) console.log(`⚑ ${s(w[m.i].startMs).toFixed(2)}  marcador "${m.mk}"  ${ctx(m.i, m.i + m.mk.split(" ").length)}`);
  const total = cortes.filter((c) => c.aplicar).reduce((acc, c) => acc + (c.fim - c.inicio), 0);
  console.log(`\n${cortes.filter((c) => c.aplicar).length} cortes marcados (${total.toFixed(1)}s), ${cortes.filter((c) => !c.aplicar).length} para revisar → ${saida}`);
}

// ---------------------------------------------------------------- aplicar
const ENCODERS = {
  libx264: ["-c:v", "libx264", "-crf", "17", "-preset", "fast"],
  h264_qsv: ["-c:v", "h264_qsv", "-global_quality", "18", "-preset", "medium"],
  h264_nvenc: ["-c:v", "h264_nvenc", "-cq", "18", "-preset", "p5"],
  h264_amf: ["-c:v", "h264_amf", "-rc", "cqp", "-qp_i", "18", "-qp_p", "18"],
  h264_videotoolbox: ["-c:v", "h264_videotoolbox", "-q:v", "65"],
};

function aplicar(video, jsonPath, cortesPath) {
  cortesPath = cortesPath || base(jsonPath) + ".cortes.json";
  const encoder = opt("encoder", "libx264");
  const palavras = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const lista = JSON.parse(fs.readFileSync(cortesPath, "utf8"));
  const cortesRaw = (Array.isArray(lista) ? lista : lista.cortes).filter((c) => c.aplicar !== false);

  const probe = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate:format=duration", "-of", "json", video], { encoding: "utf8" }),
  );
  const [num, den] = probe.streams[0].r_frame_rate.split("/").map(Number);
  const fps = num / (den || 1);
  const dur = parseFloat(probe.format.duration);
  const quadro = (t) => Math.round(t * fps) / fps; // cortes no grid de quadros: áudio e vídeo não dessincronizam

  // Ordena, prende ao grid e junta sobreposições
  const cortes = [];
  for (const c of cortesRaw.map((c) => ({ a: quadro(Math.max(0, c.inicio)), b: quadro(Math.min(dur, c.fim)) })).sort((x, y) => x.a - y.a)) {
    if (c.b - c.a < 1 / fps) continue;
    const ult = cortes[cortes.length - 1];
    if (ult && c.a <= ult.b) ult.b = Math.max(ult.b, c.b);
    else cortes.push(c);
  }
  if (!cortes.length) {
    console.log("Nenhum corte marcado com \"aplicar\": true — nada a fazer.");
    return;
  }

  // Trechos mantidos
  const manter = [];
  let t = 0;
  for (const c of cortes) {
    if (c.a > t) manter.push([t, c.a]);
    t = c.b;
  }
  if (t < dur) manter.push([t, dur]);

  const partes = manter.map(([a, b], i) => {
    const d = b - a;
    const fade = Math.min(0.008, d / 4);
    return (
      `[0:v]trim=start=${a.toFixed(6)}:end=${b.toFixed(6)},setpts=PTS-STARTPTS[v${i}];` +
      `[0:a]atrim=start=${a.toFixed(6)}:end=${b.toFixed(6)},asetpts=PTS-STARTPTS,` +
      `afade=t=in:d=${fade.toFixed(4)},afade=t=out:st=${(d - fade).toFixed(6)}:d=${fade.toFixed(4)}[a${i}];`
    );
  });
  const fmt = encoder === "h264_qsv" ? "nv12" : "yuv420p";
  const grafo =
    partes.join("") + manter.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${manter.length}:v=1:a=1[vc][a];[vc]fps=${num}/${den || 1},format=${fmt}[v]`;

  // Grafo vai num arquivo (evita limite de tamanho de linha de comando no Windows)
  const grafoPath = path.join(os.tmpdir(), `limpar-erros-${process.pid}.txt`);
  fs.writeFileSync(grafoPath, grafo);
  const versao = execFileSync("ffmpeg", ["-version"], { encoding: "utf8" }).match(/version n?(\d+)/);
  const flagGrafo = versao && +versao[1] >= 7 ? ["-/filter_complex", grafoPath] : ["-filter_complex_script", grafoPath];

  const saidaVideo = `${base(video)} - limpo.mp4`;
  const cmd = [
    "-hide_banner", "-nostdin", "-loglevel", "error", "-stats", "-y",
    "-i", video, ...flagGrafo, "-map", "[v]", "-map", "[a]",
    ...(ENCODERS[encoder] || ["-c:v", encoder]),
    "-c:a", "aac", "-b:a", "192k", "-map_metadata", "-1", "-movflags", "+faststart", saidaVideo,
  ];
  console.log(`Cortando ${cortes.length} trechos (${cortes.reduce((acc, c) => acc + c.b - c.a, 0).toFixed(1)}s) com ${encoder}...`);
  const r = spawnSync("ffmpeg", cmd, { stdio: "inherit" });
  fs.unlinkSync(grafoPath);
  if (r.status !== 0) {
    console.error(`ffmpeg falhou (código ${r.status}). Se o encoder ${encoder} não existir nesta máquina, use --encoder libx264.`);
    process.exit(1);
  }

  // Transcrição reajustada: remove palavras dentro dos cortes e puxa as seguintes para trás
  const novo = (ms) => {
    const x = ms / 1000;
    let desloc = 0;
    for (const c of cortes) {
      if (x >= c.b) desloc += c.b - c.a;
      else if (x > c.a) return null;
    }
    return Math.round((x - desloc) * 1000);
  };
  const limpas = [];
  for (const p of palavras) {
    const meio = (p.startMs + p.endMs) / 2;
    if (novo(meio) === null) continue;
    const st = novo(p.startMs) ?? novo(meio);
    const en = novo(p.endMs) ?? novo(meio);
    limpas.push({ ...p, startMs: st, endMs: Math.max(st, en), timestampMs: Math.round((st + Math.max(st, en)) / 2) });
  }
  const saidaJson = `${base(video)} - limpo.json`;
  fs.writeFileSync(saidaJson, JSON.stringify(limpas, null, 1));
  const durNova = manter.reduce((acc, [a, b]) => acc + b - a, 0);
  console.log(`OK: ${saidaVideo} (${dur.toFixed(1)}s → ${durNova.toFixed(1)}s)\n    ${saidaJson} (${palavras.length - limpas.length} palavras removidas)`);
}

// ----------------------------------------------------------------
if (modo === "detectar" && resto[0]) detectar(resto[0]);
else if (modo === "aplicar" && resto[1]) aplicar(resto[0], resto[1], resto[2]);
else {
  console.error("Uso:\n  node limpar_erros.js detectar <video.json> [--pausas 1.0] [--idioma pt]\n  node limpar_erros.js aplicar <video.mp4> <video.json> [<cortes.json>] [--encoder libx264]");
  process.exit(1);
}
