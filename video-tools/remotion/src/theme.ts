// Fonte carregada de public/fonts (ver src/fonts.ts para trocar)
import { loadLocalFont } from "./fonts";

// ==================== PERSONALIZE AQUI ====================
// O setup da skill reels-editor edita este bloco com as respostas do usuário.
export const MARCA = {
  // Cor de destaque (palavra ativa, selos, brilhos) + variações mais clara e mais escura
  accent: "#3B82F6",
  accentSoft: "#76A8F9",
  accentDeep: "#3472D8",
  // Cor do texto em cima do destaque (preto para cores claras, branco para cores escuras)
  ink: "#FFFFFF",
  legenda: {
    tamanho: 66, // px — pequena 58 · média 66 · grande 80
    peso: 700,
    caixa: "minusculas" as "minusculas" | "normal" | "maiusculas",
    maxPalavras: 3, // palavras por tela (1–4)
    posicaoY: 1300, // altura em tela cheia (1100 = mais alto, 1450 = mais baixo)
    contorno: 7, // espessura do contorno preto
  },
  barraProgresso: true,
  sfx: true, // efeitos sonoros dos motions/overlays
};
// ==========================================================

export const fontFamily = loadLocalFont();

export const COLORS = {
  bg: "#0A0A0C",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  accent: MARCA.accent,
  accentSoft: MARCA.accentSoft,
  accentDeep: MARCA.accentDeep,
  ink: MARCA.ink,
  glass: "rgba(12,12,14,0.72)",
};

export const textOutline = (px: number) => ({
  WebkitTextStroke: `${px}px #000`,
  paintOrder: "stroke fill" as const,
  textShadow: `0 ${px / 2}px ${px * 1.5}px rgba(0,0,0,0.6)`,
});
