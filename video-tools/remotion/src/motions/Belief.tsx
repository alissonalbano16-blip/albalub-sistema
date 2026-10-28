import { Easing, interpolate } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, clamp, texto, useCena, vidro } from "./kit";

// Quebra de crença: a crença racha e cai, entra "a sua visão", a visão antiga é riscada
export type BeliefProps = {
  start: number;
  word: string; // texto do cartão que quebra
  crackAt: number;
  newText: string;
  newAt: number;
  subText: string;
  subAt: number;
  oldText: string;
  oldAt: number;
  wrongAt: number;
};

const ZIGUE = [
  [52, 0],
  [46, 25],
  [57, 50],
  [44, 75],
  [50, 100],
];
const VERMELHO = "#FF3B30";

export const Belief: React.FC<BeliefProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const entrada = pop(p.start, 10);
  const risco = ramp(p.crackAt, p.crackAt + 0.15, Easing.linear);
  const quebra = ramp(p.crackAt + 0.23, p.crackAt + 1.0, Easing.in(Easing.quad));
  const tremor = t > p.crackAt && t < p.crackAt + 0.23 ? Math.sin(t * 90) * 7 : 0;
  const nova = pop(p.newAt, 9);
  const carimbo = interpolate(t, [p.subAt, p.subAt + 0.18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const antiga = pop(p.oldAt, 13);
  const errado = ramp(p.wrongAt, p.wrongAt + 0.25);
  const xis = pop(p.wrongAt + 0.15, 8);

  const zigue = ZIGUE.map(([x, y]) => `${x}% ${y}%`);
  const metade = (lado: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        clipPath:
          lado < 0 ? `polygon(0 0, ${zigue.join(", ")}, 0 100%)` : `polygon(100% 0, ${zigue.join(", ")}, 100% 100%)`,
        transform: `translate(${lado * quebra * 120}px, ${quebra * quebra * 420}px) rotate(${lado * quebra * 22}deg)`,
        opacity: 1 - quebra,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 26,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...texto(84, 900, COLORS.ink),
          letterSpacing: 2,
        }}
      >
        {p.word}
      </div>
    </div>
  );

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pop" at={p.start} volume={0.3} />
      <Som nome="glass" at={p.crackAt + 0.15} volume={0.55} />
      <Som nome="whoosh" at={p.newAt} volume={0.35} />
      <Som nome="ding" at={p.subAt} volume={0.3} />
      <Som nome="pop" at={p.oldAt} volume={0.3} />
      <Som nome="whip" at={p.wrongAt} volume={0.4} />

      {/* Cartão da crença que racha */}
      {quebra < 1 && (
        <div
          style={{
            position: "absolute",
            left: 540 - 300,
            top: 150,
            width: 600,
            height: 170,
            transform: `translateX(${tremor}px) scale(${0.5 + 0.5 * entrada}) rotate(-3deg)`,
            filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.6))",
          }}
        >
          {metade(-1)}
          {metade(1)}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 1 - quebra }}>
            <polyline
              points={ZIGUE.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={6}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - risco}
            />
          </svg>
        </div>
      )}

      {/* A sua visão */}
      <div
        style={{
          position: "absolute",
          left: 540 - 340,
          top: 130,
          width: 680,
          height: 190,
          borderRadius: 30,
          background: COLORS.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          transform: `scale(${nova}) rotate(${(1 - nova) * 10 - 2}deg)`,
          opacity: Math.min(1, nova * 2),
          boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 70px ${COLORS.accent}66`,
        }}
      >
        <Icon name="eye" size={92} color={COLORS.ink} stroke={2.6} />
        <span style={{ ...texto(80, 900, COLORS.ink), letterSpacing: -2 }}>{p.newText}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 300,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${2 - carimbo}) rotate(-5deg)`,
          opacity: carimbo,
        }}
      >
        <div
          style={{
            padding: "10px 30px",
            borderRadius: 16,
            background: "#0b0b0d",
            border: `4px solid ${COLORS.accent}`,
            ...texto(48, 800, COLORS.accent),
          }}
        >
          {p.subText}
        </div>
      </div>

      {/* A visão antiga, riscada */}
      <div
        style={{
          ...vidro,
          position: "absolute",
          left: 540 - 300,
          top: 470,
          width: 600,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${(1 - antiga) * -700}px)`,
          opacity: Math.min(1, antiga * 2) * (1 - 0.45 * errado),
        }}
      >
        <span style={texto(56, 800)}>{p.oldText}</span>
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 66,
            height: 9,
            borderRadius: 9,
            width: 500 * errado,
            background: VERMELHO,
            transform: "rotate(-4deg)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 + 250,
          top: 445,
          width: 110,
          height: 110,
          borderRadius: 999,
          background: VERMELHO,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${xis})`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        }}
      >
        <Icon name="x" size={66} color="#fff" stroke={3.4} />
      </div>
    </Area>
  );
};
