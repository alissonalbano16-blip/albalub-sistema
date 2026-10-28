import { Easing } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Avatar, Selo, texto, useCena, vidro } from "./kit";

// Comentários chovendo → engajamento enche → post sobe no ranking → alcança uma multidão
export type ReachProps = {
  start: number;
  commentsAt: number;
  comments: number;
  words: string[];
  engageAt: number;
  rankAt: number;
  rankLabel: string;
  peopleAt: number;
  peopleLabel: string;
};

const LINHA_H = 132;

export const Reach: React.FC<ReachProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const faseA = 1 - ramp(p.rankAt - 0.2, p.rankAt + 0.1);
  const faseB = ramp(p.rankAt - 0.1, p.rankAt + 0.2) * (1 - ramp(p.peopleAt - 0.2, p.peopleAt + 0.1));
  const faseC = ramp(p.peopleAt - 0.1, p.peopleAt + 0.2);

  const conta = ramp(p.commentsAt, p.engageAt + 1.2, Easing.out(Easing.cubic));
  const barra = ramp(p.engageAt, p.engageAt + 1.0, Easing.out(Easing.cubic));
  const sobe = ramp(p.rankAt + 0.3, p.rankAt + 1.2);

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pop" at={p.commentsAt} volume={0.35} />
      {[0.25, 0.5, 0.75].map((d) => (
        <Som key={d} nome="pluck" at={p.commentsAt + d} volume={0.25} />
      ))}
      <Som nome="rise" at={p.engageAt} volume={0.3} />
      <Som nome="swoosh-up" at={p.rankAt + 0.3} volume={0.4} />
      <Som nome="ding" at={p.rankAt + 1.2} volume={0.3} />
      <Som nome="whoosh" at={p.peopleAt} volume={0.35} />

      {/* A: comentários + engajamento */}
      {faseA > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: faseA }}>
          {Array.from({ length: 12 }, (_, i) => {
            const at = p.commentsAt + i * 0.16;
            const k = (t - at) / 1.5;
            if (k < 0 || k > 1) return null;
            const x = 70 + ((i * 431) % 760);
            const y = 420 - k * 330;
            return (
              <div
                key={i}
                style={{
                  ...vidro,
                  position: "absolute",
                  left: x,
                  top: y,
                  borderRadius: 999,
                  padding: "10px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: Math.min(1, k * 6, (1 - k) * 3) * 0.9,
                  transform: `scale(${Math.min(1, k * 8)})`,
                }}
              >
                <Icon name="comment" size={28} color={COLORS.accent} stroke={2.4} />
                <span style={texto(28, 800)}>{p.words[i % p.words.length]}</span>
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              transform: `scale(${pop(p.commentsAt, 10)})`,
            }}
          >
            <Icon name="comment" size={110} color={COLORS.ink} fill={COLORS.accent} stroke={1.6} />
            <span style={{ ...texto(120, 900), letterSpacing: -4 }}>{Math.round(p.comments * conta).toLocaleString("pt-BR")}</span>
          </div>
          <div style={{ position: "absolute", left: 160, width: 760, top: 470, opacity: pop(p.engageAt, 12) }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ ...texto(32, 800), letterSpacing: 3 }}>ENGAJAMENTO</span>
              <span style={texto(32, 900, COLORS.accent)}>{Math.round(barra * 100)}%</span>
            </div>
            <div style={{ height: 38, borderRadius: 99, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${barra * 100}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${COLORS.accentDeep}, ${COLORS.accent})`,
                  boxShadow: `0 0 30px ${COLORS.accent}`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* B: ranking */}
      {faseB > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: faseB }}>
          <div style={{ position: "absolute", left: 130, top: 0, display: "flex", alignItems: "center", gap: 16 }}>
            <Icon name="trendingUp" size={54} color={COLORS.accent} stroke={2.8} />
            <span style={{ ...texto(40, 900), letterSpacing: 2 }}>{p.rankLabel}</span>
          </div>
          {[0, 1, 2, 3].map((j) => {
            const seu = j === 3;
            const posicao = seu ? 3 - 3 * sobe : j + sobe;
            const destaque = seu ? sobe : 0;
            return (
              <div
                key={j}
                style={{
                  ...vidro,
                  position: "absolute",
                  left: 130,
                  width: 820,
                  top: 90 + posicao * LINHA_H,
                  height: 112,
                  borderRadius: 26,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 22px",
                  zIndex: seu ? 2 : 1,
                  border: seu ? `3px solid ${COLORS.accent}` : vidro.border,
                  transform: `scale(${seu ? 1 + 0.06 * Math.sin(sobe * Math.PI) + 0.03 * destaque : 0.97})`,
                  opacity: seu ? 1 : 0.6,
                  boxShadow: seu ? `0 20px 50px rgba(0,0,0,0.6), 0 0 ${40 * destaque}px ${COLORS.accent}77` : vidro.boxShadow,
                }}
              >
                <span style={{ ...texto(40, 900, seu ? COLORS.accent : COLORS.muted), width: 62 }}>
                  #{Math.round(posicao) + 1}
                </span>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 18,
                    background: seu
                      ? `linear-gradient(150deg, ${COLORS.accent}, #FF8A00 70%, #FF2D7A)`
                      : "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="play" size={34} color="#fff" fill="#fff" stroke={1.5} />
                </div>
                {seu ? (
                  <span style={texto(38, 800)}>seu post</span>
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ width: 330 - j * 50, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.22)" }} />
                    <div style={{ width: 200, height: 14, borderRadius: 7, marginTop: 14, background: "rgba(255,255,255,0.12)" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* C: multidão */}
      {faseC > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: faseC }}>
          {[
            { r: 150, n: 8, s: 84 },
            { r: 255, n: 14, s: 70 },
            { r: 350, n: 20, s: 58 },
          ].flatMap((anel, a) =>
            Array.from({ length: anel.n }, (_, i) => {
              const ang = (i / anel.n) * Math.PI * 2 + a * 0.3;
              const e = pop(p.peopleAt + a * 0.12 + i * 0.01, 10);
              const x = 540 + Math.cos(ang) * anel.r * e;
              const y = 310 + Math.sin(ang) * anel.r * 0.78 * e;
              return (
                <div key={`${a}-${i}`} style={{ position: "absolute", left: x - anel.s / 2, top: y - anel.s / 2, transform: `scale(${e})` }}>
                  <Avatar size={anel.s} destaque={(i + a) % 4 === 0}>
                    <Icon name="user" size={anel.s * 0.55} color={COLORS.ink} stroke={2.6} />
                  </Avatar>
                </div>
              );
            }),
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 310 - 45,
              display: "flex",
              justifyContent: "center",
              transform: `scale(${pop(p.peopleAt + 0.1, 9)})`,
            }}
          >
            <Selo style={{ fontSize: 50 }}>{p.peopleLabel}</Selo>
          </div>
        </div>
      )}
    </Area>
  );
};
