import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Avatar, Selo, texto, useCena, vidro } from "./kit";

// Post com checklist do que o conteúdo precisa ter → compartilhado com uma amiga → rede se espalhando
export type ShareNetworkProps = {
  start: number;
  checks: { label: string; at: number }[];
  shareAt: number;
  friendAt: number;
  friendLabel: string;
  spreadAt: number;
  label: string;
  labelAt: number;
};

const POST = { x: 60, y: 30, w: 470, h: 620 };
const ENVIO = { x: POST.x + 190, y: POST.y + 552 }; // ícone de enviar do post
const AMIGA = { x: 830, y: 300 };
const CTRL = { x: 600, y: -40 };
const curva = (k: number) => ({
  x: (1 - k) ** 2 * ENVIO.x + 2 * (1 - k) * k * CTRL.x + k ** 2 * AMIGA.x,
  y: (1 - k) ** 2 * ENVIO.y + 2 * (1 - k) * k * CTRL.y + k ** 2 * AMIGA.y,
});

// Rede: raiz → 3 → 9
const RAIZ = { x: 540, y: 100 };
const N1 = [230, 540, 850].map((x) => ({ x, y: 320 }));
const N2 = N1.flatMap((p) => [-95, 0, 95].map((d) => ({ x: p.x + d, y: 510, pai: p })));

export const ShareNetwork: React.FC<ShareNetworkProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const entrada = pop(p.start, 13);
  const someChecks = ramp(p.shareAt - 0.3, p.shareAt);
  const envio = pop(p.shareAt, 8);
  const voo = ramp(p.shareAt + 0.1, p.shareAt + 1.0);
  const amiga = pop(p.friendAt, 9);
  const fase1 = 1 - ramp(p.spreadAt - 0.1, p.spreadAt + 0.25);
  const fase2 = ramp(p.spreadAt, p.spreadAt + 0.3);
  const pos = curva(voo);
  const prox = curva(Math.min(1, voo + 0.01));
  const angulo = (Math.atan2(prox.y - pos.y, prox.x - pos.x) * 180) / Math.PI;

  const linha = (a: { x: number; y: number }, b: { x: number; y: number }, at: number, key: string) => {
    const k = ramp(at, at + 0.35);
    return (
      <line
        key={key}
        x1={a.x}
        y1={a.y}
        x2={a.x + (b.x - a.x) * k}
        y2={a.y + (b.y - a.y) * k}
        stroke={COLORS.accent}
        strokeOpacity={0.7}
        strokeWidth={5}
        strokeLinecap="round"
      />
    );
  };
  const t1 = (i: number) => p.spreadAt + 0.15 + i * 0.1;
  const t2 = (i: number) => p.spreadAt + 0.6 + i * 0.05;

  return (
    <Area style={{ opacity: saida }}>
      {p.checks.map((c) => (
        <Som key={c.at} nome="pop" at={c.at} volume={0.35} />
      ))}
      <Som nome="whoosh" at={p.shareAt + 0.1} volume={0.4} />
      <Som nome="pop" at={p.friendAt} volume={0.35} />
      <Som nome="swoosh-up" at={p.spreadAt} volume={0.35} />
      <Som nome="pluck" at={p.spreadAt + 0.6} volume={0.3} />
      <Som nome="ding" at={p.labelAt} volume={0.3} />

      <div style={{ position: "absolute", inset: 0, opacity: fase1 }}>
        {/* Post */}
        <div
          style={{
            ...vidro,
            position: "absolute",
            left: POST.x,
            top: POST.y,
            width: POST.w,
            height: POST.h,
            transform: `translateY(${(1 - entrada) * 90}px) rotate(${(1 - entrada) * -6}deg)`,
            opacity: entrada,
          }}
        >
          <div style={{ position: "absolute", left: 24, top: 22, display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar size={56} destaque>
              <Icon name="user" size={30} color={COLORS.ink} stroke={2.6} />
            </Avatar>
            <div style={{ width: 170, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.3)" }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              top: 100,
              height: 410,
              borderRadius: 22,
              background: `linear-gradient(150deg, ${COLORS.accent}, #FF8A00 70%, #FF2D7A)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 999,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="play" size={58} color="#fff" fill="#fff" stroke={1.5} style={{ marginLeft: 8 }} />
            </div>
          </div>
          {(["heart", "comment", "send"] as const).map((n, i) => {
            const ehEnvio = n === "send";
            return (
              <div
                key={n}
                style={{
                  position: "absolute",
                  left: 24 + i * 72,
                  top: 530,
                  width: 44,
                  height: 44,
                  transform: ehEnvio ? `scale(${1 + 0.35 * envio * (1 - voo)})` : undefined,
                }}
              >
                {ehEnvio && t >= p.shareAt && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -14 - 30 * voo,
                      borderRadius: 999,
                      border: `4px solid ${COLORS.accent}`,
                      opacity: 1 - voo,
                    }}
                  />
                )}
                <Icon
                  name={n}
                  size={44}
                  color={ehEnvio && t >= p.shareAt ? COLORS.accent : "#fff"}
                  stroke={2.2}
                />
              </div>
            );
          })}
          <div style={{ position: "absolute", right: 24, top: 530 }}>
            <Icon name="bookmark" size={44} color="#fff" stroke={2.2} />
          </div>
        </div>

        {/* Checklist */}
        <div
          style={{
            position: "absolute",
            left: 570,
            top: 110,
            display: "flex",
            flexDirection: "column",
            gap: 26,
            opacity: 1 - someChecks,
            transform: `translateX(${someChecks * 60}px)`,
          }}
        >
          {p.checks.map((c) => {
            const e = pop(c.at, 11);
            return (
              <div
                key={c.label}
                style={{
                  ...vidro,
                  borderRadius: 26,
                  width: 450,
                  height: 104,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 24px",
                  transform: `translateX(${(1 - e) * 300}px)`,
                  opacity: Math.min(1, e * 2),
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    background: COLORS.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${pop(c.at + 0.15, 8)})`,
                  }}
                >
                  <Icon name="check" size={34} color={COLORS.ink} stroke={3.4} />
                </div>
                <span style={texto(36, 800)}>{c.label}</span>
              </div>
            );
          })}
        </div>

        {/* Avião + rastro */}
        {Array.from({ length: 22 }, (_, i) => i / 22)
          .filter((k) => k < voo - 0.04 && voo < 1)
          .map((k) => {
            const q = curva(k);
            return (
              <div
                key={k}
                style={{ position: "absolute", left: q.x - 6, top: q.y - 6, width: 12, height: 12, borderRadius: 99, background: COLORS.accent }}
              />
            );
          })}
        {voo > 0 && voo < 1 && (
          <div style={{ position: "absolute", left: pos.x - 55, top: pos.y - 55, transform: `rotate(${angulo + 45}deg)` }}>
            <Icon name="send" size={110} color={COLORS.ink} fill={COLORS.accent} stroke={1.6} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: AMIGA.x - 90,
            top: AMIGA.y - 90,
            width: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            transform: `scale(${amiga})`,
          }}
        >
          <Avatar size={180} destaque>
            <Icon name="user" size={100} color={COLORS.ink} stroke={2.4} />
          </Avatar>
          <Selo style={{ fontSize: 34, padding: "8px 24px", background: "#fff" }}>{p.friendLabel}</Selo>
        </div>
      </div>

      {/* Rede se espalhando */}
      {fase2 > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: fase2 }}>
          <svg width={1080} height={720} style={{ position: "absolute", inset: 0 }}>
            {N1.map((n, i) => linha(RAIZ, n, t1(i), `a${i}`))}
            {N2.map((n, i) => linha(n.pai, n, t2(i), `b${i}`))}
          </svg>
          <div style={{ position: "absolute", left: RAIZ.x - 65, top: RAIZ.y - 65, transform: `scale(${pop(p.spreadAt, 10)})` }}>
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 30,
                background: `linear-gradient(150deg, ${COLORS.accent}, #FF8A00 70%, #FF2D7A)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 50px ${COLORS.accent}88`,
              }}
            >
              <Icon name="play" size={56} color="#fff" fill="#fff" stroke={1.5} style={{ marginLeft: 6 }} />
            </div>
          </div>
          {N1.map((n, i) => (
            <div key={i} style={{ position: "absolute", left: n.x - 50, top: n.y - 50, transform: `scale(${pop(t1(i) + 0.3, 9)})` }}>
              <Avatar size={100} destaque={i === 1}>
                <Icon name="user" size={54} color={COLORS.ink} stroke={2.6} />
              </Avatar>
            </div>
          ))}
          {N2.map((n, i) => (
            <div key={i} style={{ position: "absolute", left: n.x - 36, top: n.y - 36, transform: `scale(${pop(t2(i) + 0.3, 9)})` }}>
              <Avatar size={72} destaque={i % 4 === 0}>
                <Icon name="user" size={38} color={COLORS.ink} stroke={2.6} />
              </Avatar>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 600,
              display: "flex",
              justifyContent: "center",
              transform: `scale(${pop(p.labelAt, 10)})`,
            }}
          >
            <Selo>{p.label}</Selo>
          </div>
        </div>
      )}
    </Area>
  );
};

