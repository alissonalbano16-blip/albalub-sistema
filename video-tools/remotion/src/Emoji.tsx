import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Emoji animado (Noto Emoji do Google, Lottie, CC BY 4.0) que entra num canto da tela
const cache = new Map<string, LottieAnimationData>();

const POSICOES = {
  left: { left: 40, top: 320 },
  right: { right: 40, top: 320 },
  "left-low": { left: 90, top: 960 },
  "right-low": { right: 90, top: 960 },
};

export type EmojiPos = keyof typeof POSICOES;

export const Emoji: React.FC<{ name: string; pos?: EmojiPos; size?: number }> = ({
  name,
  pos = "right",
  size = 170,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [dados, setDados] = useState<LottieAnimationData | null>(cache.get(name) ?? null);
  const [handle] = useState(() => (cache.has(name) ? null : delayRender(`Lottie ${name}`)));

  useEffect(() => {
    if (!handle) return;
    fetch(staticFile(`lottie/${name}.json`))
      .then((r) => r.json())
      .then((json) => {
        cache.set(name, json);
        setDados(json);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, name]);

  if (!dados) return null;

  const entrada = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const saida = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lado = pos.startsWith("left") ? -1 : 1;
  const flutua = Math.sin((frame / fps) * Math.PI * 1.6) * 8;

  return (
    <div
      style={{
        position: "absolute",
        ...POSICOES[pos],
        width: size,
        height: size,
        transform: `translateY(${flutua}px) scale(${entrada * saida}) rotate(${(1 - entrada) * lado * 25}deg)`,
        filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.5))",
      }}
    >
      <Lottie animationData={dados} loop style={{ width: size, height: size }} />
    </div>
  );
};
