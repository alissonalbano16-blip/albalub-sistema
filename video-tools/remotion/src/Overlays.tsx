import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LightLeak } from "@remotion/light-leaks";
import { Emoji, type EmojiPos } from "./Emoji";
import { Cadeado, Icon, type IconName } from "./Icons";
import { Sfx } from "./motions/kit";
import { useSplit } from "./Split";
import { COLORS, fontFamily, textOutline } from "./theme";

type Base = { start: number; end: number };
export type Overlay = Base &
  (
    | { type: "counter"; prefix: string; value: number; suffix: string; label: string }
    | { type: "title"; text: string; icon?: "lock" }
    | {
        type: "headline";
        lines: { text: string; at: number; box?: boolean }[];
        side?: "center" | "right";
        centerAt?: number;
        stamp?: string;
        stampAt?: number;
        pulseAt?: number;
      }
    | { type: "roadmap"; text: string }
    | { type: "stage"; num: number; total: number; title: string }
    | { type: "tag"; text: string }
    | { type: "crack"; text: string }
    | { type: "reactions"; upAt: number; downAt: number }
    | { type: "hearts" }
    | { type: "share"; friendAt: number }
    | { type: "flow"; steps: { icon: IconName; label: string; at: number }[] }
    | { type: "growth"; label: string }
    | { type: "people" }
    | { type: "cta"; line1: string; line2: string }
    | { type: "emoji"; name: string; pos?: EmojiPos; size?: number }
    | { type: "leak"; seed?: number; hue?: number }
  );

// Ícone de cada etapa da jornada
const ICONES_ETAPA: IconName[] = ["zap", "send", "infinity"];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

// Saída suave nos últimos frames de cada overlay
const useSaida = (frames = 7) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], clamp);
};

const pop = (frame: number, fps: number, delayS = 0, damping = 11) =>
  spring({ frame: frame - Math.round(delayS * fps), fps, config: { damping, stiffness: 200 } });


const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 7], [0, 0.18, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o }} />;
};

const Topo: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const Pilula: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      padding: "10px 28px",
      borderRadius: 999,
      background: COLORS.accent,
      color: COLORS.ink,
      fontFamily,
      fontWeight: 800,
      fontSize: 34,
      letterSpacing: 1,
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────── Números ───────────── */

const Counter: React.FC<Extract<Overlay, { type: "counter" }>> = ({ prefix, value, suffix, label }) => {
  const { frame, fps } = useT();
  const saida = useSaida();
  const entrada = pop(frame, fps, 0, 12);
  const progresso = interpolate(frame, [0, 0.8 * fps], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const numero = Math.round(value * progresso).toLocaleString("pt-BR");
  const labelIn = pop(frame, fps, 0.45, 14);

  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Sfx nome="coins" volume={0.45} />
      <Sfx nome="ding" at={0.8} volume={0.3} />
      <Topo top={170} style={{ transform: `scale(${0.5 + 0.5 * entrada})`, opacity: entrada }}>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 140,
            letterSpacing: -4,
            lineHeight: 1,
            color: COLORS.text,
            ...textOutline(8),
          }}
        >
          {prefix}
          <span style={{ color: COLORS.accent }}>{numero}</span>
          {suffix}
        </div>
        <Pilula style={{ marginTop: 18, transform: `translateY(${(1 - labelIn) * 30}px)`, opacity: labelIn }}>
          {label}
        </Pilula>
      </Topo>
    </AbsoluteFill>
  );
};

/* ───────────── Títulos ───────────── */

const Title: React.FC<Extract<Overlay, { type: "title" }>> = ({ text, icon }) => {
  const { frame, fps } = useT();
  const saida = useSaida(5);
  const entrada = pop(frame, fps, 0, 9);
  const abertura = interpolate(frame, [0.3 * fps, 0.45 * fps], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Flash />
      <Sfx nome="whoosh" volume={0.35} />
      {icon === "lock" && <Sfx nome="unlock" at={0.3} volume={0.5} />}
      <Topo
        top={icon ? 150 : 230}
        style={{ transform: `scale(${0.3 + 0.7 * entrada}) rotate(${(1 - entrada) * -6}deg)` }}
      >
        {icon === "lock" && (
          <div style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))", marginBottom: 6 }}>
            <Cadeado size={130} color={COLORS.accent} abertura={abertura} />
          </div>
        )}
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 104,
            letterSpacing: -3,
            lineHeight: 1,
            textAlign: "center",
            color: COLORS.text,
            ...textOutline(9),
          }}
        >
          {text}
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

/* ───────────── Jornada (3 etapas) ───────────── */

const NO = 78;
const TRILHO = 150;

// Trilho com os nós das etapas; `atual` 0 = nenhuma ativa
const Trilho: React.FC<{ total: number; atual: number; preenchido: number; aparecer: (i: number) => number }> = ({
  total,
  atual,
  preenchido,
  aparecer,
}) => {
  const { frame, fps } = useT();
  const pulso = atual ? 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 1.2) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const feito = n < atual;
        const ativo = n === atual;
        const s = aparecer(i);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{ width: TRILHO, height: 8, borderRadius: 8, background: "rgba(255,255,255,0.25)" }}>
                <div
                  style={{
                    width: `${Math.max(0, Math.min(1, preenchido - (i - 1))) * 100}%`,
                    height: "100%",
                    borderRadius: 8,
                    background: COLORS.accent,
                  }}
                />
              </div>
            )}
            <div
              style={{
                width: NO,
                height: NO,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: feito || ativo ? COLORS.accent : COLORS.glass,
                border: `4px solid ${feito || ativo ? COLORS.accent : "rgba(255,255,255,0.45)"}`,
                boxShadow: ativo
                  ? `0 0 0 ${6 + 8 * pulso}px ${COLORS.accent}${Math.round((0.35 - 0.2 * pulso) * 255).toString(16).padStart(2, "0")}, 0 8px 22px rgba(0,0,0,0.5)`
                  : "0 8px 22px rgba(0,0,0,0.5)",
                transform: `scale(${s})`,
              }}
            >
              <Icon
                name={feito ? "check" : ICONES_ETAPA[i] ?? "zap"}
                size={40}
                color={feito || ativo ? COLORS.ink : "rgba(255,255,255,0.8)"}
                stroke={feito ? 3.2 : 2.4}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Roadmap: React.FC<Extract<Overlay, { type: "roadmap" }>> = ({ text }) => {
  const { frame, fps } = useT();
  const saida = useSaida(5);
  const entrada = pop(frame, fps, 0, 10);
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Flash />
      <Sfx nome="whoosh" volume={0.35} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} nome="pluck" at={0.2 + i * 0.14} volume={0.35} />
      ))}
      <Topo top={200} style={{ gap: 26, transform: `scale(${0.4 + 0.6 * entrada})` }}>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 96,
            letterSpacing: -3,
            lineHeight: 1,
            color: COLORS.text,
            ...textOutline(8),
          }}
        >
          {text}
        </div>
        <Trilho total={3} atual={0} preenchido={0} aparecer={(i) => pop(frame, fps, 0.2 + i * 0.14, 9)} />
      </Topo>
    </AbsoluteFill>
  );
};

// Entra grande, o trilho avança até a etapa atual e depois encolhe para o topo
const Stage: React.FC<Extract<Overlay, { type: "stage" }>> = ({ num, total, title }) => {
  const { frame, fps } = useT();
  const saida = useSaida(8);
  const entrada = pop(frame, fps, 0, 12);
  const avanca = interpolate(frame, [0.15 * fps, 0.6 * fps], [num - 2, num - 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const chegou = pop(frame, fps, 0.55, 8);
  const recolhe = interpolate(frame, [1.15 * fps, 1.55 * fps], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const escala = interpolate(recolhe, [0, 1], [1.2, 0.86]) * (0.6 + 0.4 * entrada);
  const top = interpolate(recolhe, [0, 1], [300, 110]);

  return (
    <AbsoluteFill style={{ opacity: saida * entrada }}>
      <Flash />
      <Sfx nome="whoosh" volume={0.35} />
      <Sfx nome="ding" at={0.55} volume={0.3} />
      <Topo top={top} style={{ gap: 14, transform: `scale(${escala})`, transformOrigin: "50% 0%" }}>
        <Trilho
          total={total}
          atual={num}
          preenchido={avanca}
          aparecer={(i) => (i + 1 === num ? 0.85 + 0.15 * chegou : 1)}
        />
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 50,
            lineHeight: 1.05,
            letterSpacing: -0.5,
            textAlign: "center",
            whiteSpace: "pre-line",
            color: COLORS.text,
            ...textOutline(6),
          }}
        >
          <span style={{ color: COLORS.accent }}>{num}.</span> {title}
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

const Tag: React.FC<Extract<Overlay, { type: "tag" }>> = ({ text }) => {
  const { frame, fps } = useT();
  const saida = useSaida(8);
  const entrada = pop(frame, fps, 0, 14);
  return (
    <AbsoluteFill style={{ opacity: saida * entrada }}>
      <Sfx nome="pop" volume={0.3} />
      <Topo top={252} style={{ transform: `translateY(${(1 - entrada) * -20}px)` }}>
        <div
          style={{
            padding: "8px 22px",
            borderRadius: 10,
            border: `2px solid ${COLORS.accent}`,
            background: COLORS.glass,
            fontFamily,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 3,
            color: COLORS.accent,
          }}
        >
          {text}
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

/* ───────────── Etapa 1: quebra de crença ───────────── */

const ZIGUE = [
  [52, 0],
  [46, 25],
  [57, 50],
  [44, 75],
  [50, 100],
];

const Crack: React.FC<Extract<Overlay, { type: "crack" }>> = ({ text }) => {
  const { frame, fps } = useT();
  const entrada = pop(frame, fps, 0, 10);
  const risco = interpolate(frame, [0.45 * fps, 0.6 * fps], [0, 1], clamp);
  const quebra = interpolate(frame, [0.68 * fps, 1.5 * fps], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const tremor = frame > 0.45 * fps && frame < 0.68 * fps ? Math.sin(frame * 3) * 6 : 0;

  const zigue = ZIGUE.map(([x, y]) => `${x}% ${y}%`);
  const esquerda = `polygon(0 0, ${zigue.join(", ")}, 0 100%)`;
  const direita = `polygon(100% 0, ${zigue.join(", ")}, 100% 100%)`;

  const cartao = (clip: string, lado: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        clipPath: clip,
        transform: `translate(${lado * quebra * 90}px, ${quebra * quebra * 260}px) rotate(${lado * quebra * 18}deg)`,
        opacity: 1 - quebra,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 22,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 68,
          letterSpacing: 2,
          color: COLORS.ink,
        }}
      >
        {text}
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Sfx nome="pop" volume={0.35} />
      <Sfx nome="glass" at={0.5} volume={0.55} />
      <Topo top={330}>
        <div
          style={{
            position: "relative",
            width: 470,
            height: 130,
            transform: `translateX(${tremor}px) scale(${0.5 + 0.5 * entrada}) rotate(-3deg)`,
            filter: "drop-shadow(0 12px 26px rgba(0,0,0,0.55))",
          }}
        >
          {cartao(esquerda, -1)}
          {cartao(direita, 1)}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 1 - quebra }}
          >
            <polyline
              points={ZIGUE.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={5}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - risco}
            />
          </svg>
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

const Reactions: React.FC<Extract<Overlay, { type: "reactions" }>> = ({ upAt, downAt }) => {
  const { frame, fps } = useT();
  const saida = useSaida(8);
  const balao = (at: number, lado: -1 | 1, label: string) => {
    const s = pop(frame, fps, at, 8);
    const balanco = Math.sin((frame / fps - at) * 9) * 10 * Math.exp(-(frame / fps - at) * 2.5);
    return (
      <div
        style={{
          position: "absolute",
          top: 360,
          [lado < 0 ? "left" : "right"]: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          transform: `scale(${s}) rotate(${frame / fps > at ? balanco : 0}deg)`,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            background: lado < 0 ? COLORS.accent : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
          }}
        >
          <Icon name="thumbUp" size={76} color={COLORS.ink} stroke={2.4} style={lado > 0 ? { transform: "rotate(180deg)" } : {}} />
        </div>
        <Pilula style={{ fontSize: 26, padding: "6px 18px", background: COLORS.glass, color: "#fff" }}>{label}</Pilula>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Sfx nome="pop" at={upAt} volume={0.4} />
      <Sfx nome="pop" at={downAt} volume={0.4} />
      {balao(upAt, -1, "CONCORDA")}
      {balao(downAt, 1, "DISCORDA")}
    </AbsoluteFill>
  );
};

// Corações subindo pelas laterais (engajamento)
const CORACOES = [
  { x: 90, d: 0, s: 1, w: 0 },
  { x: 960, d: 0.08, s: 0.8, w: 1 },
  { x: 160, d: 0.18, s: 0.7, w: 2 },
  { x: 890, d: 0.26, s: 1.1, w: 3 },
  { x: 60, d: 0.36, s: 0.9, w: 4 },
  { x: 990, d: 0.44, s: 0.75, w: 5 },
  { x: 130, d: 0.55, s: 0.85, w: 6 },
  { x: 920, d: 0.62, s: 0.95, w: 7 },
];

const Hearts: React.FC = () => {
  const { t } = useT();
  return (
    <AbsoluteFill>
      <Sfx nome="pluck" volume={0.35} />
      <Sfx nome="pluck" at={0.3} volume={0.3} />
      {CORACOES.map((c, i) => {
        const p = (t - c.d) / 1.1;
        if (p < 0 || p > 1) return null;
        const y = interpolate(p, [0, 1], [1150, 420], { easing: Easing.out(Easing.quad) });
        const x = c.x - 40 + Math.sin(p * Math.PI * 2 + c.w) * 30;
        const o = interpolate(p, [0, 0.1, 0.75, 1], [0, 1, 1, 0]);
        const s = c.s * interpolate(p, [0, 0.15], [0.3, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${s})` }}>
            <Icon name="heart" size={84} color="#fff" fill="#FF3B5C" stroke={1.4} style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.5))" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── Etapa 2: compartilhamento ───────────── */

const P0 = { x: 110, y: 330 };
const P1 = { x: 540, y: -60 };
const P2 = { x: 900, y: 230 };
const bezier = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});

const Share: React.FC<Extract<Overlay, { type: "share" }>> = ({ friendAt }) => {
  const { frame, fps, t } = useT();
  const saida = useSaida(8);
  const voo = interpolate(t, [0.1, 1.0], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pos = bezier(voo);
  const prox = bezier(Math.min(1, voo + 0.01));
  const angulo = (Math.atan2(prox.y - pos.y, prox.x - pos.x) * 180) / Math.PI;
  const aviao = interpolate(t, [0.95, 1.15], [1, 0], clamp);
  const pontos = Array.from({ length: 24 }, (_, i) => i / 24).filter((k) => k < voo - 0.04);
  const amigos = [0, 1, 2].map((i) => pop(frame, fps, friendAt + i * 0.12, 9));

  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Sfx nome="whoosh" at={0.1} volume={0.4} />
      <Sfx nome="pop" at={friendAt} volume={0.35} />
      <div style={{ position: "absolute", top: 260, left: 0, width: 1080, height: 520 }}>
        {pontos.map((k) => {
          const p = bezier(k);
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: p.x - 6,
                top: p.y - 6,
                width: 12,
                height: 12,
                borderRadius: 99,
                background: COLORS.accent,
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: pos.x - 60,
            top: pos.y - 60,
            opacity: aviao,
            transform: `rotate(${angulo + 45}deg)`,
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))",
          }}
        >
          <Icon name="send" size={120} color={COLORS.ink} fill={COLORS.accent} stroke={1.6} />
        </div>
        {/* Amigos que recebem o conteúdo */}
        {amigos.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: P2.x - 70 + (i - 1) * 78,
              top: P2.y + 20 + (i === 1 ? 0 : 36),
              width: 104,
              height: 104,
              borderRadius: 999,
              background: i === 1 ? COLORS.accent : "#fff",
              border: "4px solid #111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${s})`,
              zIndex: i === 1 ? 2 : 1,
              boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
            }}
          >
            <Icon name="user" size={58} color={COLORS.ink} stroke={2.6} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Etapa 3: comentário → link → produto ───────────── */

const Flow: React.FC<Extract<Overlay, { type: "flow" }>> = ({ steps }) => {
  const { frame, fps, t } = useT();
  const saida = useSaida(8);
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      {steps.map((s, i) => (
        <Sfx key={i} nome="pop" at={s.at} volume={0.4} />
      ))}
      <Topo top={320}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {steps.map((s, i) => {
            const e = pop(frame, fps, s.at, 9);
            const seta = interpolate(t, [s.at - 0.25, s.at], [0, 1], clamp);
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                {i > 0 && (
                  <div style={{ width: 90, height: 120, display: "flex", alignItems: "center" }}>
                    <svg width={90} height={30} viewBox="0 0 90 30" style={{ opacity: seta > 0 ? 1 : 0 }}>
                      <line x1={6} y1={15} x2={6 + 70 * seta} y2={15} stroke={COLORS.accent} strokeWidth={7} strokeLinecap="round" />
                      {seta > 0.9 && (
                        <path d="M66 4 L82 15 L66 26" fill="none" stroke={COLORS.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                      )}
                    </svg>
                  </div>
                )}
                <div
                  style={{
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    transform: `scale(${e})`,
                    opacity: Math.min(1, e * 2),
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 30,
                      background: i === steps.length - 1 ? COLORS.accent : COLORS.glass,
                      border: `4px solid ${COLORS.accent}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Icon name={s.icon} size={64} color={i === steps.length - 1 ? COLORS.ink : COLORS.accent} stroke={2.2} />
                  </div>
                  <div
                    style={{
                      fontFamily,
                      fontWeight: 800,
                      fontSize: 28,
                      letterSpacing: 1,
                      color: COLORS.text,
                      ...textOutline(5),
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

// Gráfico subindo (o Instagram ranqueia e entrega para mais gente)
const PONTOS_GRAFICO = [
  [0, 150],
  [70, 138],
  [140, 142],
  [210, 118],
  [280, 104],
  [350, 70],
  [420, 30],
  [470, 4],
];

const Growth: React.FC<Extract<Overlay, { type: "growth" }>> = ({ label }) => {
  const { frame, fps } = useT();
  const saida = useSaida(6);
  const entrada = pop(frame, fps, 0, 12);
  const desenho = interpolate(frame, [0.2 * fps, 1.1 * fps], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const d = PONTOS_GRAFICO.map(([x, y], i) => `${i ? "L" : "M"}${x + 30} ${y + 20}`).join(" ");
  const area = `${d} L500 190 L30 190 Z`;
  const ultimo = PONTOS_GRAFICO[PONTOS_GRAFICO.length - 1];
  const seta = pop(frame, fps, 1.05, 8);

  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Sfx nome="rise" at={0.2} volume={0.3} />
      <Topo top={300} style={{ transform: `scale(${0.6 + 0.4 * entrada})`, opacity: entrada }}>
        <div
          style={{
            width: 580,
            padding: "22px 26px 18px",
            borderRadius: 30,
            background: COLORS.glass,
            border: "2px solid rgba(255,255,255,0.15)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: COLORS.text }}>{label}</div>
            <div
              style={{
                fontFamily,
                fontWeight: 800,
                fontSize: 30,
                color: COLORS.ink,
                background: COLORS.accent,
                borderRadius: 12,
                padding: "2px 14px",
                transform: `scale(${seta})`,
              }}
            >
              ↑ {Math.round(desenho * 340)}%
            </div>
          </div>
          <svg width={528} height={200} viewBox="0 0 528 200">
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
              </linearGradient>
              <clipPath id="revela">
                <rect x={0} y={0} width={30 + 470 * desenho + 10} height={200} />
              </clipPath>
            </defs>
            <path d={area} fill="url(#g)" clipPath="url(#revela)" />
            <path
              d={d}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - desenho}
            />
            <circle cx={ultimo[0] + 30} cy={ultimo[1] + 20} r={12 * seta} fill="#fff" stroke={COLORS.accent} strokeWidth={5} />
          </svg>
        </div>
      </Topo>
    </AbsoluteFill>
  );
};

// Multidão aparecendo (o conteúdo chega para mais pessoas)
const People: React.FC = () => {
  const { frame, fps } = useT();
  const saida = useSaida(6);
  const colunas = 7;
  const linhas = 2;
  return (
    <AbsoluteFill style={{ opacity: saida }}>
      <Sfx nome="pluck" volume={0.3} />
      <Sfx nome="pluck" at={0.2} volume={0.3} />
      <Topo top={320} style={{ gap: 14 }}>
        {Array.from({ length: linhas }, (_, l) => (
          <div key={l} style={{ display: "flex", gap: 14 }}>
            {Array.from({ length: colunas }, (_, c) => {
              const dist = Math.abs(c - (colunas - 1) / 2) + l * 0.6;
              const s = pop(frame, fps, dist * 0.05, 9);
              const destaque = (c + l) % 3 === 0;
              return (
                <div
                  key={c}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 999,
                    background: destaque ? COLORS.accent : "#fff",
                    border: "4px solid #111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${s})`,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  <Icon name="user" size={52} color={COLORS.ink} stroke={2.6} />
                </div>
              );
            })}
          </div>
        ))}
      </Topo>
    </AbsoluteFill>
  );
};

/* ───────────── CTA ───────────── */

const Cta: React.FC<Extract<Overlay, { type: "cta" }>> = ({ line1, line2 }) => {
  const { frame, fps } = useT();
  const entrada = pop(frame, fps, 0, 10);
  const pulso = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2 * 1.4);
  const quique = Math.abs(Math.sin((frame / fps) * Math.PI * 2)) * -16;

  return (
    <AbsoluteFill>
      <Flash />
      <Sfx nome="whoosh" volume={0.35} />
      <Sfx nome="ding" at={0.2} volume={0.35} />
      <Topo top={150} style={{ transform: `scale(${(0.4 + 0.6 * entrada) * pulso})`, opacity: entrada }}>
        <div style={{ transform: `translateY(${quique}px)`, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))" }}>
          <Icon name="comment" size={110} color={COLORS.ink} fill={COLORS.accent} stroke={1.6} />
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: 6,
            color: COLORS.text,
            ...textOutline(7),
          }}
        >
          {line1}
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "14px 38px",
            borderRadius: 22,
            background: COLORS.accent,
            boxShadow: "0 14px 36px rgba(0,0,0,0.5)",
            fontFamily,
            fontWeight: 900,
            fontSize: 74,
            letterSpacing: -1,
            color: COLORS.ink,
          }}
        >
          {line2}
        </div>
      </Topo>
    </AbsoluteFill>
  );
};


/* ───────────── Headline de abertura ───────────── */

// Linhas entram de baixo com desfoque; `box: true` vira faixa amarela com texto preto (revelada por wipe).
// `*palavra*` = destaque amarelo. Começa ao lado (side "right", menor) e desliza para o centro em `centerAt`.
const Destaque: React.FC<{ text: string; cor?: string }> = ({ text, cor = COLORS.accent }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((parte, i) =>
      parte.startsWith("*") ? (
        <span key={i} style={{ color: cor }}>
          {parte.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{parte}</span>
      ),
    )}
  </>
);

const Headline: React.FC<Extract<Overlay, { type: "headline" }>> = ({ lines, side, centerAt, stamp, stampAt, pulseAt }) => {
  const { frame, fps, t } = useT();
  const saida = useSaida(8);
  const lado = side === "right" ? 1 : 0;
  const centro = centerAt === undefined ? 0 : interpolate(t, [centerAt, centerAt + 0.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = 540 + 205 * lado * (1 - centro);
  const escala = 1 - 0.32 * lado * (1 - centro);
  const fundo = interpolate(t, [0, 0.4], [0, 1], clamp);
  const pulso = pulseAt === undefined ? 0 : interpolate(t, [pulseAt, pulseAt + 0.1, pulseAt + 0.4], [0, 1, 0], clamp);
  const selo = stampAt === undefined ? 0 : interpolate(t, [stampAt, stampAt + 0.2], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });

  return (
    <AbsoluteFill style={{ opacity: saida }}>
      {lines.map((l, i) => (
        <Sfx key={i} nome={l.box ? "whoosh" : "pop"} at={l.at} volume={l.box ? 0.4 : 0.3} />
      ))}
      {stamp && stampAt !== undefined && <Sfx nome="coins" at={stampAt} volume={0.45} />}
      {centerAt !== undefined && <Sfx nome="swoosh-up" at={centerAt} volume={0.25} />}
      {pulseAt !== undefined && <Sfx nome="ding" at={pulseAt} volume={0.35} />}

      {/* sombra para leitura sobre o vídeo */}
      <AbsoluteFill
        style={{
          opacity: fundo,
          background: `radial-gradient(ellipse 620px 360px at ${x}px 300px, rgba(0,0,0,0.6), rgba(0,0,0,0) 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: 150,
          transform: `translateX(-50%) scale(${escala})`,
          transformOrigin: "50% 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {lines.map((l, i) => {
          const k = pop(frame, fps, l.at, 14);
          const base: React.CSSProperties = {
            fontFamily,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -3,
            whiteSpace: "nowrap",
            transform: `translateY(${(1 - k) * 60}px)`,
            filter: `blur(${Math.max(0, 1 - k) * 14}px)`,
            opacity: Math.min(1, k * 2),
          };
          if (l.box) {
            const wipe = interpolate(t, [l.at + 0.05, l.at + 0.35], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{ ...base, position: "relative", transform: `${base.transform} rotate(-2deg) scale(${1 + 0.08 * pulso})` }}>
                <div
                  style={{
                    padding: "10px 30px 14px",
                    borderRadius: 18,
                    background: COLORS.accent,
                    color: COLORS.ink,
                    fontSize: 108,
                    clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 18px)`,
                    boxShadow: `0 0 ${40 + 60 * pulso}px ${COLORS.accent}88`,
                  }}
                >
                  <Destaque text={l.text} cor="#fff" />
                </div>
              </div>
            );
          }
          const ultima = i === lines.length - 1;
          return (
            <div key={i} style={{ ...base, position: "relative", fontSize: 100, color: COLORS.text, ...textOutline(9) }}>
              <Destaque text={l.text} />
              {ultima && stamp && selo > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    top: "50%",
                    marginLeft: 18,
                    transform: `translateY(-50%) rotate(12deg) scale(${2.2 - 1.2 * selo})`,
                    opacity: Math.min(1, selo * 1.5),
                    padding: "8px 18px",
                    borderRadius: 16,
                    border: `6px solid ${COLORS.accent}`,
                    background: "rgba(0,0,0,0.55)",
                    color: COLORS.accent,
                    fontSize: 64,
                    letterSpacing: -1,
                    WebkitTextStroke: 0,
                    textShadow: "none",
                    boxShadow: `0 0 30px ${COLORS.accent}66`,
                  }}
                >
                  {stamp}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
const COMPONENTES: { [K in Overlay["type"]]: React.FC<any> } = {
  counter: Counter,
  title: Title,
  headline: Headline,
  roadmap: Roadmap,
  stage: Stage,
  tag: Tag,
  crack: Crack,
  reactions: Reactions,
  hearts: Hearts,
  share: Share,
  flow: Flow,
  growth: Growth,
  people: People,
  cta: Cta,
  emoji: ({ name, pos, size }) => (
    <>
      <Sfx nome="pluck" volume={0.2} />
      <Emoji name={name} pos={pos} size={size} />
    </>
  ),
  // Luz de vazamento (light leak) nas viradas de etapa
  leak: ({ seed = 0, hue = 0 }) => (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.55 }}>
      <LightLeak seed={seed} hueShift={hue} />
    </AbsoluteFill>
  ),
};

export const Overlays: React.FC<{ overlays: Overlay[] }> = ({ overlays }) => {
  const { fps } = useVideoConfig();
  const split = useSplit();
  return (
    <AbsoluteFill>
      {overlays.map((o, i) => {
        const Comp = COMPONENTES[o.type];
        const de = Math.round(o.start * fps);
        const dur = Math.max(1, Math.round((o.end - o.start) * fps));
        // Na tela dividida o painel de cima é do motion: overlays somem (menos a luz)
        const visivel = o.type === "leak" ? 1 : 1 - split;
        return (
          <Sequence key={i} from={de} durationInFrames={dur} layout="none">
            <AbsoluteFill style={{ opacity: visivel }}>
              <Comp {...o} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
