import type { Scene } from "./Split";

// Vitrine de todos os motions (composição "Catalogo"). Cada demo é escrito com tempos a partir de 0
// e deslocado automaticamente. Ao criar um motion novo, adicione um demo aqui.
type Demo = { nome: string; uso: string; dur: number; scene: Omit<Scene, "start" | "end"> & Record<string, unknown> };

const DEMOS: Demo[] = [
  {
    nome: "statement",
    uso: "gancho · tese · frase de impacto",
    dur: 5,
    scene: {
      motion: "statement",
      icon: "bulb",
      iconAt: 0.3,
      lines: [
        { text: "ninguém te conta", at: 0.6 },
        { text: "essa estratégia", at: 1.6, accent: true },
      ],
    },
  },
  {
    nome: "bigNumber",
    uso: "resultado · número que impressiona",
    dur: 5,
    scene: { motion: "bigNumber", icon: "dollar", prefix: "R$", value: 30000, countAt: 0.5, countEnd: 2.0, label: "SEM ANÚNCIO" },
  },
  {
    nome: "profile",
    uso: "prova social · crescimento de perfil",
    dur: 5,
    scene: { motion: "profile", name: "Sua cliente", handle: "@cliente", to: 180000, countAt: 0.6, countEnd: 1.8, label: "+180 MIL SEGUIDORES" },
  },
  {
    nome: "chart",
    uso: "faturamento / resultado ao longo do tempo",
    dur: 5,
    scene: {
      motion: "chart",
      title: "faturamento",
      points: [3000, 4200, 3900, 8000, 14500, 30000],
      xLabels: ["jan", "fev", "mar", "abr", "mai", "jun"],
      prefix: "R$ ",
      drawAt: 0.5,
      drawEnd: 2.6,
      label: "10X EM 6 MESES",
    },
  },
  {
    nome: "compare",
    uso: "antes × depois · errado × certo",
    dur: 6.5,
    scene: {
      motion: "compare",
      left: { title: "ANTES", at: 0.3, items: [{ text: "posta todo dia", at: 0.7 }, { text: "sem vender", at: 1.2 }, { text: "depende de ads", at: 1.7 }] },
      right: { title: "DEPOIS", at: 2.4, items: [{ text: "conteúdo certo", at: 2.8 }, { text: "vende no direct", at: 3.3 }, { text: "orgânico", at: 3.8 }] },
      verdict: "MUDE A ESTRATÉGIA",
      verdictAt: 4.6,
    },
  },
  {
    nome: "belief",
    uso: "quebra de crença · mudança de visão",
    dur: 7,
    scene: {
      motion: "belief",
      word: "CRENÇA",
      crackAt: 0.4,
      newText: "SUA VISÃO",
      newAt: 2.4,
      subText: "é diferente",
      subAt: 3.1,
      oldText: "a visão dela",
      oldAt: 4.4,
      wrongAt: 5.8,
    },
  },
  {
    nome: "timeline",
    uso: "método em etapas · jornada",
    dur: 7,
    scene: {
      motion: "timeline",
      steps: [
        { label: "Atrair", sub: "conteúdo compartilhável", icon: "users", at: 0.4 },
        { label: "Engajar", sub: "palavra-chave no comentário", icon: "comment", at: 1.9 },
        { label: "Converter", sub: "oferta no direct", icon: "send", at: 3.4 },
        { label: "Escalar", sub: "repete o que funciona", icon: "rocket", at: 4.9 },
      ],
      doneAt: 6.0,
      doneLabel: "FUNIL COMPLETO",
    },
  },
  {
    nome: "options",
    uso: "lista de exemplos / dicas (até 4)",
    dur: 6,
    scene: {
      motion: "options",
      header: "você manda no direct:",
      headerIcon: "send",
      items: [
        { icon: "utensils", title: "Receitas saudáveis", sub: "PDF / e-book", at: 0.6 },
        { icon: "book", title: "Seu método", sub: "para emagrecimento", at: 1.6 },
        { icon: "play", title: "Vídeo no YouTube", sub: "explica a dor", at: 2.6 },
      ],
      footer: "RESOLVE A DOR",
      footerAt: 4.0,
    },
  },
  {
    nome: "shareNetwork",
    uso: "compartilhamento · viralização",
    dur: 9,
    scene: {
      motion: "shareNetwork",
      checks: [
        { label: "relevante", at: 0.4 },
        { label: "transforma", at: 1.2 },
        { label: "ganho rápido", at: 2.0 },
      ],
      shareAt: 3.2,
      friendAt: 4.2,
      friendLabel: "amiga",
      spreadAt: 5.3,
      label: "PÚBLICO QUALIFICADO",
      labelAt: 6.5,
    },
  },
  {
    nome: "commentFunnel",
    uso: "comente X → direct → produto",
    dur: 7,
    scene: {
      motion: "commentFunnel",
      keyword: "QUERO",
      typeAt: 0.4,
      postAt: 1.4,
      dmAt: 2.6,
      link: "acesse aqui",
      productAt: 3.4,
      product: "Seu produto",
      productSub: "a solução da dor",
      solveAt: 5.0,
      solveText: "RESOLVE A DOR",
    },
  },
  {
    nome: "reach",
    uso: "engajamento → algoritmo → alcance",
    dur: 8,
    scene: {
      motion: "reach",
      commentsAt: 0.3,
      comments: 1248,
      words: ["quero", "eu quero!", "QUERO", "manda"],
      engageAt: 1.2,
      rankAt: 3.0,
      rankLabel: "INSTAGRAM RANQUEIA",
      peopleAt: 5.4,
      peopleLabel: "MAIS PESSOAS",
    },
  },
  {
    nome: "offerStack",
    uso: "oferta de VSL · ancoragem de preço",
    dur: 7,
    scene: {
      motion: "offerStack",
      items: [
        { label: "Curso completo", value: 997, at: 0.4, icon: "play" },
        { label: "Templates prontos", value: 297, at: 1.0, icon: "package" },
        { label: "Mentoria em grupo", value: 1497, at: 1.6, icon: "users" },
        { label: "Bônus: scripts", value: 197, at: 2.2, icon: "gift" },
      ],
      totalAt: 3.0,
      priceAt: 4.3,
      price: 497,
    },
  },
];

// Campos de tempo: start/end, "at", "*At", "*End"
const ehTempo = (k: string) => k === "at" || /At$|End$/.test(k);
const deslocar = (v: unknown, dt: number, chave = ""): unknown => {
  if (typeof v === "number") return ehTempo(chave) ? v + dt : v;
  if (Array.isArray(v)) return v.map((x) => deslocar(x, dt));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deslocar(x, dt, k)]));
  return v;
};

const RESPIRO = 1.2; // tela "vazia" entre demos, com o nome do próximo

export const catalogo = () => {
  let t = 0.5;
  const scenes: Scene[] = [];
  const nomes: { nome: string; uso: string; start: number; end: number }[] = [];
  for (const d of DEMOS) {
    const start = t;
    const end = t + d.dur;
    scenes.push({ ...(deslocar(d.scene, start) as object), start, end } as Scene);
    nomes.push({ nome: d.nome, uso: d.uso, start, end });
    t = end + RESPIRO;
  }
  return { scenes, nomes, duracao: t };
};
