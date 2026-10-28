import type { Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FULL, SPLIT_Y, useFull, useSplit } from "./Split";
import { COLORS, fontFamily, MARCA, textOutline } from "./theme";

const L = MARCA.legenda;
const MAX_PALAVRAS = L.maxPalavras;
const MAX_CARACTERES = Math.round((22 * 66) / L.tamanho); // cabe numa linha
const PAUSA_QUEBRA_MS = 350;

type Pagina = { startMs: number; endMs: number; words: Caption[] };

// Agrupa em 2–3 palavras: quebra no fim de frase, em pausas ou quando a linha fica longa
export const agruparPaginas = (captions: Caption[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Caption[] = [];
  const fechar = () => {
    if (atual.length) {
      paginas.push({ startMs: atual[0].startMs, endMs: atual[atual.length - 1].endMs, words: atual });
      atual = [];
    }
  };
  for (const c of captions) {
    if (atual.length) {
      const ultima = atual[atual.length - 1];
      const texto = atual.map((w) => w.text.trim()).join(" ") + " " + c.text.trim();
      const fimFrase = /[.!?…,]$/.test(ultima.text.trim());
      if (
        atual.length >= MAX_PALAVRAS ||
        texto.length > MAX_CARACTERES ||
        c.startMs - ultima.endMs > PAUSA_QUEBRA_MS ||
        (fimFrase && atual.length >= 2) ||
        /[.!?…]$/.test(ultima.text.trim())
      ) {
        fechar();
      }
    }
    atual.push(c);
  }
  fechar();
  return paginas;
};

// Caixa da legenda (MARCA.legenda.caixa), sem vírgula/ponto no fim; preserva R$ e marcas
const minuscula = (t: string) => {
  const limpo = t.trim().replace(/[,.;:]$/, "");
  if (L.caixa === "normal") return limpo;
  if (L.caixa === "maiusculas") return limpo.toUpperCase();
  return limpo
    .toLowerCase()
    .replace(/^r\$/, "R$")
    .replace(/^instagram/, "Instagram")
    .replace(/^youtube/, "YouTube");
};

const PaginaLegenda: React.FC<{ pagina: Pagina }> = ({ pagina }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const split = useSplit();
  const full = useFull();
  const agoraMs = pagina.startMs + (frame / fps) * 1000;

  const entrada = spring({ frame, fps, config: { damping: 11, stiffness: 220 }, durationInFrames: 9 });
  const escala = 0.8 + 0.2 * entrada;
  const sobe = (1 - entrada) * 18;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          // Na tela dividida a legenda senta em cima da divisória
          top: L.posicaoY * (1 - split) + (full ? FULL.legendaY : SPLIT_Y - 44) * split,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 22,
          width: 960,
          textAlign: "center",
          fontFamily,
          fontWeight: L.peso,
          fontSize: L.tamanho,
          lineHeight: 1.08,
          letterSpacing: -0.5,
          color: COLORS.text,
          transform: `translateY(${sobe}px) scale(${escala})`,
          ...textOutline(L.contorno),
        }}
      >
        {pagina.words.map((w, i) => {
          const ativa = w.startMs <= agoraMs && agoraMs < (pagina.words[i + 1]?.startMs ?? Infinity);
          const pop = ativa
            ? spring({
                frame: Math.round(((agoraMs - w.startMs) / 1000) * fps),
                fps,
                config: { damping: 10, stiffness: 260 },
                durationInFrames: 7,
              })
            : 0;
          return (
            <span
              key={w.startMs}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                color: ativa ? COLORS.accent : COLORS.text,
                fontWeight: ativa ? Math.min(900, L.peso + 100) : L.peso,
                transform: `scale(${ativa ? 1 + 0.08 * pop : 1})`,
                textShadow: ativa
                  ? `0 0 22px ${COLORS.accent}66, 0 4px 14px rgba(0,0,0,0.7)`
                  : "0 4px 14px rgba(0,0,0,0.7)",
              }}
            >
              {minuscula(w.text)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const paginas = useMemo(() => agruparPaginas(captions), [captions]);

  return (
    <AbsoluteFill>
      {paginas.map((p, i) => {
        const proxima = paginas[i + 1];
        const de = Math.round((p.startMs / 1000) * fps);
        const ate = Math.round((Math.min(proxima?.startMs ?? Infinity, p.endMs + 500) / 1000) * fps);
        if (ate <= de) return null;
        return (
          <Sequence key={p.startMs} from={de} durationInFrames={ate - de} layout="none">
            <PaginaLegenda pagina={p} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
