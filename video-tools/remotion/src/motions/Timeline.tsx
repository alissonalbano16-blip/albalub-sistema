import { Easing, interpolate } from "remotion";
import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, Carimbo, clamp, Ladrilho, Shockwave, texto, useCena } from "./kit";

// Jornada em passos: o passo atual aparece GRANDE no centro (ícone + título + sub) e
// um trilho embaixo mostra o progresso, com um ponto de luz viajando entre os nós.
// Use para "primeiro... depois... por fim", método em etapas, antes→durante→depois.
export type TimelineProps = {
  start: number;
  steps: { label: string; sub?: string; icon?: IconName; at: number }[];
  doneAt?: number;
  doneLabel?: string;
};

const TRILHO_Y = 520;
const X0 = 130;
const X1 = 950;

export const Timeline: React.FC<TimelineProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const n = p.steps.length;
  const xNo = (i: number) => (n === 1 ? 540 : X0 + ((X1 - X0) * i) / (n - 1));
  const atual = p.steps.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);

  // Posição do ponto de luz: anda até o nó do passo atual em 0.4s
  let xLuz = X0;
  p.steps.forEach((s, i) => {
    const k = interpolate(t, [s.at - 0.1, s.at + 0.3], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    if (k > 0) xLuz = xNo(i - 1 < 0 ? 0 : i - 1) + (xNo(i) - xNo(i - 1 < 0 ? 0 : i - 1)) * k;
  });
  const trilho = pop(p.start + 0.05, 14);

  return (
    <Area style={{ opacity: saida }}>
      {p.steps.map((s) => (
        <Som key={s.at} nome="pop" at={s.at} volume={0.35} />
      ))}
      {p.doneAt !== undefined && <Som nome="ding" at={p.doneAt} volume={0.4} />}

      {/* Passo atual em destaque */}
      {p.steps.map((s, i) => {
        const e = pop(s.at, 12);
        const proximo = p.steps[i + 1];
        const sai = proximo ? interpolate(t, [proximo.at - 0.05, proximo.at + 0.2], [0, 1], clamp) : 0;
        if (e <= 0.001 || sai >= 1) return null;
        return (
          <div
            key={s.at}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: Math.min(1, e * 1.5) * (1 - sai),
              transform: `translateX(${(1 - e) * 260 - sai * 260}px) scale(${0.85 + 0.15 * e})`,
            }}
          >
            <Ladrilho size={150} ativo>
              {s.icon ? (
                <Icon name={s.icon} size={80} color={COLORS.accent} stroke={2.2} />
              ) : (
                <span style={texto(84, 900, COLORS.accent)}>{i + 1}</span>
              )}
            </Ladrilho>
            <div style={{ ...texto(s.label.length > 18 ? 54 : 64, 900), marginTop: 26, textAlign: "center", maxWidth: 960 }}>{s.label}</div>
            {s.sub && <div style={{ ...texto(34, 600, COLORS.muted), marginTop: 10, textAlign: "center" }}>{s.sub}</div>}
          </div>
        );
      })}

      {/* Trilho */}
      <div
        style={{
          position: "absolute",
          left: X0,
          top: TRILHO_Y - 3,
          width: (X1 - X0) * trilho,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: X0,
          top: TRILHO_Y - 3,
          width: Math.max(0, xLuz - X0),
          height: 6,
          borderRadius: 3,
          background: COLORS.accent,
          boxShadow: `0 0 20px ${COLORS.accent}`,
        }}
      />
      {p.steps.map((s, i) => {
        const feito = i <= atual;
        const k = pop(p.start + 0.1 + i * 0.06, 12);
        return (
          <div key={s.at}>
            <Shockwave t={t} at={s.at + 0.25} x={xNo(i)} y={TRILHO_Y} raio={90} aneis={1} />
            <div
              style={{
                position: "absolute",
                left: xNo(i) - 30,
                top: TRILHO_Y - 30,
                width: 60,
                height: 60,
                borderRadius: 999,
                background: feito ? COLORS.accent : "#141418",
                border: `3px solid ${feito ? COLORS.accent : "rgba(255,255,255,0.25)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${k * (i === atual ? 1.15 : 1)})`,
                boxShadow: feito ? `0 0 26px ${COLORS.accent}aa` : undefined,
                ...texto(28, 900, feito ? COLORS.ink : COLORS.muted),
              }}
            >
              {i < atual || (p.doneAt !== undefined && t >= p.doneAt) ? (
                <Icon name="check" size={32} color={COLORS.ink} stroke={3.4} />
              ) : (
                i + 1
              )}
            </div>
            <div
              style={{
                position: "absolute",
                left: xNo(i) - 110,
                width: 220,
                top: TRILHO_Y + 44,
                textAlign: "center",
                opacity: k,
                ...texto(n > 4 ? 22 : 26, i === atual ? 800 : 600, i === atual ? COLORS.text : COLORS.muted),
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
      {/* Ponto de luz */}
      {atual >= 0 && (
        <div
          style={{
            position: "absolute",
            left: xLuz - 12,
            top: TRILHO_Y - 12,
            width: 24,
            height: 24,
            borderRadius: 999,
            background: "#fff",
            boxShadow: `0 0 20px #fff, 0 0 50px ${COLORS.accent}`,
          }}
        />
      )}

      {p.doneLabel && p.doneAt !== undefined && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
          <Carimbo t={t} at={p.doneAt} size={40}>
            {p.doneLabel}
          </Carimbo>
        </div>
      )}
    </Area>
  );
};
