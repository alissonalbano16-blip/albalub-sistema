import { Easing, interpolate } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, clamp, fmtNum, Selo, Shockwave, texto, useCena, vidro } from "./kit";

// Gráfico de linha se desenhando com área iluminada, ponto de luz na ponta e o valor seguindo.
// Use para faturamento crescendo, seguidores, resultado ao longo dos meses. Pontos em ordem.
export type ChartProps = {
  start: number;
  points: number[];
  drawAt: number;
  drawEnd: number;
  title?: string;
  prefix?: string;
  suffix?: string;
  compacto?: boolean;
  xLabels?: string[];
  label?: string;
  labelAt?: number;
  down?: boolean; // gráfico caindo (vermelho) — para "suas vendas caíram"
};

const X0 = 90;
const X1 = 990;
const Y0 = 150; // topo do gráfico
const Y1 = 560; // base

export const Chart: React.FC<ChartProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const cor = p.down ? "#FF3B30" : COLORS.accent;
  const max = Math.max(...p.points) * 1.08;
  const min = Math.min(0, ...p.points);
  const n = p.points.length;
  const px = (i: number) => X0 + ((X1 - X0) * i) / (n - 1);
  const py = (v: number) => Y1 - ((v - min) / (max - min)) * (Y1 - Y0);
  const k = interpolate(t, [p.drawAt, p.drawEnd], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

  // Ponta da linha
  const pos = k * (n - 1);
  const i0 = Math.min(n - 2, Math.floor(pos));
  const f = pos - i0;
  const vPonta = p.points[i0] + (p.points[i0 + 1] - p.points[i0]) * f;
  const xPonta = px(i0) + (px(i0 + 1) - px(i0)) * f;
  const yPonta = py(vPonta);

  const linha = p.points.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");
  const area = `${linha} L${X1},${Y1} L${X0},${Y1} Z`;
  const cab = pop(p.start + 0.05, 13);
  const labelAt = p.labelAt ?? p.drawEnd + 0.2;
  const selo = pop(labelAt, 12);
  const terminou = t >= p.drawEnd;
  const valor = `${p.prefix ?? ""}${fmtNum(vPonta, p.compacto)}${p.suffix ?? ""}`;

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="rise" at={p.drawAt} volume={0.28} />
      <Som nome={p.down ? "whip" : "ding"} at={p.drawEnd} volume={0.4} />
      {p.label && <Som nome="pop" at={labelAt} volume={0.3} />}

      {p.title && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center", opacity: cab, transform: `translateY(${(1 - cab) * -40}px)` }}>
          <div style={{ ...vidro, borderRadius: 999, padding: "12px 32px", display: "flex", alignItems: "center", gap: 14 }}>
            <Icon name={p.down ? "trendingDown" : "trendingUp"} size={38} color={cor} stroke={2.6} />
            <span style={texto(34, 800)}>{p.title}</span>
          </div>
        </div>
      )}

      <svg width={1080} height={720} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity={0.45} />
            <stop offset="100%" stopColor={cor} stopOpacity={0} />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={0} y={0} width={xPonta} height={720} />
          </clipPath>
          <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* grade */}
        {[0, 1, 2, 3].map((g) => (
          <line
            key={g}
            x1={X0}
            x2={X1}
            y1={Y0 + ((Y1 - Y0) * g) / 3}
            y2={Y0 + ((Y1 - Y0) * g) / 3}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={2}
            strokeDasharray="6 10"
            opacity={cab}
          />
        ))}
        <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke="rgba(255,255,255,0.25)" strokeWidth={3} opacity={cab} />
        <g clipPath="url(#chartClip)">
          <path d={area} fill="url(#chartArea)" />
          <path d={linha} fill="none" stroke={cor} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" filter="url(#chartGlow)" />
        </g>
        {p.points.map((v, i) =>
          px(i) <= xPonta + 1 ? <circle key={i} cx={px(i)} cy={py(v)} r={9} fill="#0b0b0e" stroke={cor} strokeWidth={4} /> : null,
        )}
      </svg>

      {(p.xLabels ?? []).map((l, i) => (
        <div
          key={l + i}
          style={{
            position: "absolute",
            left: px(i) - 80,
            width: 160,
            top: Y1 + 16,
            textAlign: "center",
            opacity: cab * (px(i) <= xPonta + 1 ? 1 : 0.35),
            ...texto(26, 700, COLORS.muted),
          }}
        >
          {l}
        </div>
      ))}

      {k > 0 && (
        <>
          <Shockwave t={t} at={p.drawEnd} x={xPonta} y={yPonta} raio={200} aneis={2} cor={cor} />
          <div
            style={{
              position: "absolute",
              left: xPonta - 16,
              top: yPonta - 16,
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "#fff",
              boxShadow: `0 0 24px #fff, 0 0 60px ${cor}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: Math.min(X1 - 300, Math.max(X0, xPonta - 150)),
              width: 300,
              top: yPonta - 110,
              textAlign: "center",
              ...texto(terminou ? 64 : 52, 900, terminou ? cor : COLORS.text),
              textShadow: `0 0 30px ${cor}88, 0 4px 16px rgba(0,0,0,0.8)`,
              whiteSpace: "nowrap",
            }}
          >
            {valor}
          </div>
        </>
      )}

      {p.label && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", transform: `scale(${selo})` }}>
          <Selo style={p.down ? { background: cor, color: "#fff" } : undefined}>{p.label}</Selo>
        </div>
      )}
    </Area>
  );
};
