import type { Caption } from "@remotion/captions";
import { Video } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FULL, SPLIT_Y, useFull, useSplit } from "./Split";
import { COLORS } from "./theme";

const ZOOM_PERTO = 1.14;
const TRANSICAO_S = 0.14;
const SOCO = 0.08;
const ZOOM_SPLIT = 1.2;
const FOCO_SPLIT = 0.3; // quanto do topo do quadro é cortado na tela dividida (rosto)
const ZOOM_FULL = 1.35; // zoom do rosto dentro da bolha (layout full)
const FOCO_FULL = 0.3;

// Início de cada frase = palavra logo depois de um ponto final/exclamação/interrogação
const iniciosDeFrase = (captions: Caption[]) => {
  const inicios = [0];
  captions.forEach((c, i) => {
    if (i > 0 && /[.!?…]$/.test(captions[i - 1].text.trim())) inicios.push(c.startMs / 1000);
  });
  return inicios;
};

export const ZoomVideo: React.FC<{ src: string; captions: Caption[]; socos: number[] }> = ({
  src,
  captions,
  socos,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const split = useSplit();
  const full = useFull();
  const inicios = useMemo(() => iniciosDeFrase(captions), [captions]);

  // Alterna perto/longe a cada frase, com uma transição curta
  let k = 0;
  while (k + 1 < inicios.length && inicios[k + 1] <= t) k++;
  const nivel = (i: number) => (i % 2 === 1 ? ZOOM_PERTO : 1);
  const base = interpolate(t - inicios[k], [0, TRANSICAO_S], [nivel(k - 1 < 0 ? 0 : k - 1), nivel(k)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Soco" de zoom nos momentos de destaque
  const soco = socos.reduce((acc, s) => {
    const d = t - s;
    return d >= 0 && d < 0.8 ? acc + SOCO * Math.exp(-d * 6) * Math.min(1, d / 0.05) : acc;
  }, 0);

  if (full) {
    // Layout full: o quadro inteiro encolhe até virar uma bolha redonda embaixo, com anel amarelo
    const { bolha, bolhaY } = FULL;
    const lerp = (a: number, b: number) => a + (b - a) * split;
    const w = lerp(1080, bolha);
    const h = lerp(1920, bolha);
    return (
      <div
        style={{
          position: "absolute",
          left: lerp(0, 540 - bolha / 2),
          top: lerp(0, bolhaY - bolha / 2),
          width: w,
          height: h,
          borderRadius: lerp(0, bolha / 2),
          overflow: "hidden",
          backgroundColor: "#000",
          border: split > 0.5 ? `6px solid ${COLORS.accent}` : undefined,
          boxShadow: split > 0.5 ? `0 0 40px ${COLORS.accent}88, 0 20px 60px rgba(0,0,0,0.7)` : undefined,
        }}
      >
        <Video
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `50% ${FOCO_FULL * 100 * split}%`,
            transform: `scale(${lerp(base + soco, ZOOM_FULL)})`,
            transformOrigin: "50% 40%",
          }}
        />
      </div>
    );
  }

  // Na tela dividida o vídeo ocupa só a parte de baixo, sem zoom-soco
  const zoom = (base + soco) * (1 - split) + ZOOM_SPLIT * split;
  const topo = SPLIT_Y * split;

  return (
    <AbsoluteFill style={{ top: topo, height: 1920 - topo, overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 38%" }}>
        <Video
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${FOCO_SPLIT * 100 * split}%` }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
