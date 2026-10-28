import { Audio } from "@remotion/media";
import { Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily, MARCA } from "../theme";

// Peças comuns dos motions da tela dividida.
// Convenção: todo tempo nas props é ABSOLUTO (segundos do vídeo, igual à transcrição);
// o componente recebe `start` (início da cena) e converte.

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Sfx: React.FC<{ nome: string; at?: number; volume?: number }> = ({ nome, at = 0, volume = 0.4 }) => {
  const { fps } = useVideoConfig();
  if (!MARCA.sfx) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at * fps))} layout="none">
      <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
    </Sequence>
  );
};

export const useCena = (start: number) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = start + frame / fps;
  const pop = (at: number, damping = 11, stiffness = 200) =>
    spring({ frame: frame - Math.round((at - start) * fps), fps, config: { damping, stiffness } });
  const ramp = (a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
    interpolate(t, [a, b], [0, 1], { ...clamp, easing });
  const saida = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], clamp);
  // Som num tempo absoluto
  const Som: React.FC<{ nome: string; at: number; volume?: number }> = ({ nome, at, volume }) =>
    at >= start ? <Sfx nome={nome} at={at - start} volume={volume} /> : null;
  return { frame, fps, t, pop, ramp, saida, Som };
};

// Área útil do painel de cima (abaixo da barra do Instagram, acima da divisória)
export const AREA = { top: 140, height: 720 };

export const Area: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 0, top: AREA.top, width: 1080, height: AREA.height, ...style }}>
    {children}
  </div>
);

export const vidro: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(38,38,44,0.95), rgba(18,18,22,0.95))",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 32,
  boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
};

export const texto = (size: number, weight = 800, color: string = COLORS.text): React.CSSProperties => ({
  fontFamily,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.1,
  letterSpacing: size > 50 ? -1 : 0,
});

// Selo/pílula de destaque
export const Selo: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 30px",
      borderRadius: 999,
      background: COLORS.accent,
      color: COLORS.ink,
      fontFamily,
      fontWeight: 900,
      fontSize: 40,
      letterSpacing: 0.5,
      boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 40px ${COLORS.accent}55`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Avatar: React.FC<{ size: number; destaque?: boolean; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  size,
  destaque,
  style,
  children,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: destaque ? COLORS.accent : "#F2F2F2",
      border: `${Math.max(3, size / 22)}px solid #0d0d10`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

// Posiciona algo pelo centro (x, y) dentro da Área
export const Centro: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  children,
  style,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
  </div>
);

// ---------- Estética "Motion Prompt": luz é o assunto ----------

// Número no formato brasileiro: 30000 -> "30.000"; com `compacto`, 180000 -> "180 mil"
export const fmtNum = (n: number, compacto = false, casas = 0) => {
  if (compacto && n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (compacto && n >= 10_000) return `${Math.round(n / 1000).toLocaleString("pt-BR")} mil`;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
};

// Onda de choque: anéis que se expandem e somem a partir de `at` (tempo absoluto)
export const Shockwave: React.FC<{
  t: number;
  at: number;
  x: number;
  y: number;
  raio?: number;
  aneis?: number;
  cor?: string;
}> = ({ t, at, x, y, raio = 420, aneis = 3, cor = COLORS.accent }) => {
  if (t < at) return null;
  return (
    <>
      {Array.from({ length: aneis }).map((_, i) => {
        const d = t - at - i * 0.12;
        if (d < 0 || d > 0.9) return null;
        const k = Easing.out(Easing.cubic)(Math.min(1, d / 0.9));
        const r = 40 + raio * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: 999,
              border: `${Math.max(1.5, 6 * (1 - k))}px solid ${cor}`,
              opacity: (1 - k) * (i === 0 ? 0.9 : 0.5),
              boxShadow: `0 0 30px ${cor}66`,
            }}
          />
        );
      })}
    </>
  );
};

// Brilho (bloom) atrás de um elemento: mancha radial que pulsa
export const Bloom: React.FC<{ x: number; y: number; w?: number; h?: number; forca?: number; cor?: string }> = ({
  x,
  y,
  w = 700,
  h = 420,
  forca = 1,
  cor = COLORS.accent,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      background: `radial-gradient(ellipse at center, ${cor}${Math.round(Math.min(1, 0.35 * forca) * 255)
        .toString(16)
        .padStart(2, "0")}, transparent 65%)`,
      filter: "blur(10px)",
      pointerEvents: "none",
    }}
  />
);

// Texto sendo digitado; a última letra digitada pisca em amarelo, cursor piscando
export const Digitando: React.FC<{
  t: number;
  at: number;
  texto: string;
  porLetra?: number;
  style?: React.CSSProperties;
  cursor?: boolean;
}> = ({ t, at, texto: txt, porLetra = 0.045, style, cursor = true }) => {
  const n = Math.max(0, Math.min(txt.length, Math.floor((t - at) / porLetra)));
  const terminou = n >= txt.length;
  const desdeUltima = t - at - n * porLetra;
  const flash = n > 0 && !terminou ? 1 : Math.max(0, 1 - (t - at - txt.length * porLetra) / 0.35);
  const cursorOn = Math.floor(t * 2.5) % 2 === 0 || !terminou;
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {txt.slice(0, Math.max(0, n - 1))}
      {n > 0 && (
        <span style={{ color: flash > 0.05 ? COLORS.accent : undefined, textShadow: flash > 0.05 ? `0 0 24px ${COLORS.accent}` : undefined }}>
          {txt[n - 1]}
        </span>
      )}
      {cursor && t >= at && (
        <span style={{ opacity: cursorOn && (!terminou || desdeUltima < 3) ? 1 : 0, color: COLORS.accent, marginLeft: 2 }}>|</span>
      )}
    </span>
  );
};

// Tempo de digitação de um texto (para planejar o próximo evento)
export const duracaoDigitando = (txt: string, porLetra = 0.045) => txt.length * porLetra;

// Ladrilho de vidro com ícone (estilo app icon) — use com <Icon> dentro
export const Ladrilho: React.FC<{ size?: number; ativo?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size = 150,
  ativo,
  children,
  style,
}) => (
  <div
    style={{
      ...vidro,
      width: size,
      height: size,
      borderRadius: size * 0.27,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: ativo ? `3px solid ${COLORS.accent}` : vidro.border,
      boxShadow: ativo ? `${vidro.boxShadow}, 0 0 50px ${COLORS.accent}55` : vidro.boxShadow,
      ...style,
    }}
  >
    {children}
  </div>
);

// Carimbo amarelo (entra grande e "bate")
export const Carimbo: React.FC<{ t: number; at: number; children: React.ReactNode; rot?: number; size?: number; style?: React.CSSProperties }> = ({
  t,
  at,
  children,
  rot = -4,
  size = 44,
  style,
}) => {
  const k = interpolate(t, [at, at + 0.18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  if (k <= 0) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 30px",
        borderRadius: 16,
        background: COLORS.accent,
        boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 40px ${COLORS.accent}55`,
        transform: `scale(${2 - k}) rotate(${rot}deg)`,
        opacity: k,
        whiteSpace: "nowrap",
        ...texto(size, 900, COLORS.ink),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const VERMELHO = "#FF3B30";
