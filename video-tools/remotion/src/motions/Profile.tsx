import { Easing, interpolate } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Avatar, clamp, Selo, texto, useCena, vidro } from "./kit";

// Perfil do Instagram com o número de seguidores explodindo e avatares voando para dentro
export type ProfileProps = {
  start: number;
  name: string;
  handle: string;
  to: number; // seguidores no fim
  countAt: number;
  countEnd: number;
  label: string; // selo final, ex.: "+180 MIL SEGUIDORES"
};

const fmt = (n: number) =>
  n >= 1000
    ? `${(Math.floor(n / 100) / 10).toLocaleString("pt-BR", { maximumFractionDigits: n < 10000 ? 1 : 0 })} mil`
    : `${Math.round(n)}`;

const CARD = { x: 130, y: 90, w: 820, h: 420 };
const ALVO = { x: CARD.x + 520, y: CARD.y + 95 }; // número de seguidores

export const Profile: React.FC<ProfileProps> = ({ start, name, handle, to, countAt, countEnd, label }) => {
  const { t, fps, frame, pop, ramp, saida, Som } = useCena(start);
  const entrada = pop(start, 13);
  const conta = ramp(countAt, countEnd, Easing.out(Easing.cubic));
  const contando = t >= countAt && t <= countEnd + 0.2;
  const pulso = contando ? 1 + 0.08 * Math.abs(Math.sin(t * 14)) : 1;
  const giro = (frame / fps) * 90;
  const selo = pop(countEnd, 10);

  const stats: [string, string][] = [
    ["312", "posts"],
    [fmt(to * conta), "seguidores"],
    ["410", "seguindo"],
  ];

  const voadores = Array.from({ length: 12 }, (_, i) => {
    const lanca = countAt + (i * (countEnd - countAt)) / 13;
    const p = interpolate(t, [lanca, lanca + 0.55], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    if (p <= 0 || p >= 1) return null;
    const x0 = 80 + ((i * 373) % 920);
    const y0 = 700;
    const x = x0 + (ALVO.x - x0) * p;
    const y = y0 + (ALVO.y - y0) * p - Math.sin(p * Math.PI) * 120;
    return (
      <div
        key={i}
        style={{ position: "absolute", left: x - 35, top: y - 35, transform: `scale(${1 - 0.6 * p})`, opacity: 1 - p * 0.3 }}
      >
        <Avatar size={70} destaque={i % 3 === 0}>
          <Icon name="user" size={38} color={COLORS.ink} stroke={2.6} />
        </Avatar>
      </div>
    );
  });

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pluck" at={countAt} volume={0.3} />
      <Som nome="rise" at={countAt} volume={0.3} />
      <Som nome="ding" at={countEnd} volume={0.35} />
      <div
        style={{
          ...vidro,
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          transform: `translateY(${(1 - entrada) * 80}px) scale(${0.85 + 0.15 * entrada})`,
          opacity: entrada,
        }}
      >
        {/* Avatar com anel de stories girando */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 40,
            width: 150,
            height: 150,
            borderRadius: 999,
            background: `conic-gradient(from ${giro}deg, ${COLORS.accent}, #FF8A00, #FF2D7A, ${COLORS.accent})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 7,
              borderRadius: 999,
              background: "#1c1c22",
              border: "5px solid #0e0e10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="user" size={70} color="#fff" stroke={2} />
          </div>
        </div>
        {stats.map(([n, l], i) => {
          const cx = 330 + i * 190;
          const ehSeg = i === 1;
          return (
            <div
              key={l}
              style={{
                position: "absolute",
                left: cx - 110,
                width: 220,
                top: 58,
                textAlign: "center",
                transform: ehSeg ? `scale(${pulso})` : undefined,
              }}
            >
              <div style={{ ...texto(ehSeg ? 50 : 42, 800, ehSeg && t >= countAt ? COLORS.accent : COLORS.text) }}>{n}</div>
              <div style={{ ...texto(24, 500, COLORS.muted), marginTop: 6 }}>{l}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 40, top: 218, display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={texto(34, 800)}>{name}</span>
          <span style={texto(26, 500, COLORS.muted)}>{handle}</span>
        </div>
        {[520, 380].map((w, i) => (
          <div
            key={w}
            style={{ position: "absolute", left: 40, top: 272 + i * 30, width: w, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.14)" }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 340,
            height: 54,
            borderRadius: 14,
            background: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...texto(26, 800, COLORS.ink),
          }}
        >
          Seguir
        </div>
      </div>
      {voadores}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${selo}) rotate(${(1 - selo) * -8}deg)`,
          opacity: Math.min(1, selo * 2),
        }}
      >
        <Selo style={{ fontSize: 48 }}>
          <Icon name="trendingUp" size={48} color={COLORS.ink} stroke={3} />
          {label}
        </Selo>
      </div>
    </Area>
  );
};
