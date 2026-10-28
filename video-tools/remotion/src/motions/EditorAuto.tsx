import { interpolate } from "remotion";
import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, Carimbo, clamp, Shockwave, texto, useCena, vidro } from "./kit";

// Editor trabalhando sozinho: janela com prévia 9:16 + 4 trilhas (vídeo, legenda, motion, efeitos).
// O vídeo é cortado, os blocos de legenda/motion/som vão preenchendo, a agulha corre e o
// percentual sobe até `doneAt`, quando bate o carimbo.
export type EditorAutoProps = {
  start: number;
  openAt: number;
  cutAt: number;
  captionsAt: number;
  motionsAt: number;
  sfxAt: number;
  doneAt: number;
  doneLabel?: string;
  title?: string;
};

const LANE_X = 420;
const LANE_W = 560;
const ROW_Y = 120;
const ROW_H = 74;
const ROW_GAP = 20;
const CORTES = [0.24, 0.5, 0.77];

const TRILHAS: { icon: IconName; label: string }[] = [
  { icon: "scissors", label: "vídeo" },
  { icon: "type", label: "legenda" },
  { icon: "sparkles", label: "motion" },
  { icon: "volume", label: "efeitos" },
];

export const EditorAuto: React.FC<EditorAutoProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const janela = pop(p.openAt, 14);
  const prog = interpolate(t, [p.cutAt, p.doneAt], [0, 1], clamp);
  const pronto = t >= p.doneAt;
  const rowTop = (i: number) => ROW_Y + i * (ROW_H + ROW_GAP);

  const status = pronto
    ? "pronto!"
    : t < p.cutAt
      ? "carregando vídeo…"
      : t < p.captionsAt
        ? "cortando pausas e erros…"
        : t < p.motionsAt
          ? "gerando legendas…"
          : t < p.sfxAt
            ? "criando animações…"
            : "adicionando efeitos…";

  const legendas = Array.from({ length: 8 }, (_, i) => ({ x: 8 + i * 68, w: 56, at: p.captionsAt + i * 0.11 }));
  const motions = [0, 1, 2].map((i) => ({ x: 20 + i * 180, w: 140, at: p.motionsAt + i * 0.22 }));
  const efeitos = Array.from({ length: 6 }, (_, i) => ({ x: 30 + i * 90, w: 46, at: p.sfxAt + i * 0.12 }));
  const palavras = ["legenda", "palavra", "por palavra"];
  const palavra = palavras[Math.min(palavras.length - 1, Math.max(0, Math.floor((t - p.captionsAt) / 0.35)))];

  const Bloco: React.FC<{ x: number; w: number; at: number; row: number; cor: string; borda?: string }> = ({ x, w, at, row, cor, borda }) => {
    const k = pop(at, 12);
    if (k <= 0.01) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: LANE_X + x,
          top: rowTop(row) + 14,
          width: w,
          height: ROW_H - 28,
          borderRadius: 10,
          background: cor,
          border: borda,
          transform: `scaleY(${k})`,
          opacity: Math.min(1, k * 2),
        }}
      />
    );
  };

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pop" at={p.openAt} volume={0.3} />
      {CORTES.map((c, i) => (
        <Som key={c} nome="whip" at={p.cutAt + 0.15 + i * 0.3} volume={0.28} />
      ))}
      {legendas.filter((_, i) => i % 2 === 0).map((b) => (
        <Som key={b.at} nome="tick" at={b.at} volume={0.25} />
      ))}
      {motions.map((b) => (
        <Som key={b.at} nome="pluck" at={b.at} volume={0.3} />
      ))}
      <Som nome="rise" at={p.sfxAt} volume={0.25} />
      <Som nome="ding" at={p.doneAt} volume={0.45} />

      <div
        style={{
          ...vidro,
          position: "absolute",
          left: 40,
          top: 14,
          width: 1000,
          height: 600,
          transform: `scale(${0.88 + 0.12 * janela})`,
          opacity: janela,
          border: pronto ? `3px solid ${COLORS.accent}` : vidro.border,
          overflow: "hidden",
        }}
      >
        {/* barra de título */}
        <div style={{ position: "absolute", left: 28, top: 24, display: "flex", gap: 10 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 99, background: c, opacity: 0.8 }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 120, top: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sparkles" size={34} color={COLORS.accent} stroke={2.4} />
          <span style={{ ...texto(30, 800) }}>{p.title ?? "Editor IA"}</span>
        </div>
        <div style={{ position: "absolute", right: 28, top: 14, ...texto(34, 900, COLORS.accent) }}>
          {Math.round(prog * 100)}%
        </div>

        {/* prévia 9:16 */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 80,
            width: 280,
            height: 490,
            borderRadius: 24,
            background: "linear-gradient(170deg, #26262d, #0d0d10)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", opacity: 0.55 }}>
            <Icon name="user" size={190} color="#8a8a96" stroke={1.6} />
          </div>
          {/* corte: flash */}
          {CORTES.map((c, i) => {
            const f = interpolate(t, [p.cutAt + 0.15 + i * 0.3, p.cutAt + 0.22 + i * 0.3, p.cutAt + 0.4 + i * 0.3], [0, 0.5, 0], clamp);
            return f > 0 ? <div key={c} style={{ position: "absolute", inset: 0, background: "#fff", opacity: f }} /> : null;
          })}
          {/* motion entrando na prévia */}
          {(() => {
            const k = pop(p.motionsAt, 13);
            return k > 0.01 ? (
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  top: 26,
                  height: 92,
                  borderRadius: 16,
                  background: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transform: `translateY(${(1 - k) * -140}px)`,
                  boxShadow: `0 0 30px ${COLORS.accent}66`,
                }}
              >
                <Icon name="trendingUp" size={46} color={COLORS.ink} stroke={3} />
                <span style={{ ...texto(34, 900, COLORS.ink) }}>+300%</span>
              </div>
            ) : null;
          })()}
          {/* legenda na prévia */}
          {t >= p.captionsAt && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center" }}>
              <span style={{ ...texto(34, 800, COLORS.accent), padding: "4px 14px", background: "rgba(0,0,0,0.55)", borderRadius: 10 }}>
                {palavra}
              </span>
            </div>
          )}
          {/* onda de som */}
          {t >= p.sfxAt && (
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, height: 50, display: "flex", alignItems: "flex-end", gap: 6 }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const h = 10 + 38 * Math.abs(Math.sin(t * 9 + i * 1.3)) * ramp(p.sfxAt, p.sfxAt + 0.3);
                return <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: "#fff", opacity: 0.85 }} />;
              })}
            </div>
          )}
        </div>

        {/* trilhas */}
        {TRILHAS.map((tr, i) => {
          const ativa =
            (i === 0 && t >= p.cutAt && t < p.captionsAt) ||
            (i === 1 && t >= p.captionsAt && t < p.motionsAt) ||
            (i === 2 && t >= p.motionsAt && t < p.sfxAt) ||
            (i === 3 && t >= p.sfxAt && !pronto);
          return (
            <div key={tr.label}>
              <div
                style={{
                  position: "absolute",
                  left: 336,
                  top: rowTop(i) + 5,
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: ativa ? COLORS.accent : "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: ativa ? `0 0 30px ${COLORS.accent}88` : undefined,
                }}
              >
                <Icon name={tr.icon} size={34} color={ativa ? COLORS.ink : "#cfcfd6"} stroke={2.4} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: LANE_X,
                  top: rowTop(i),
                  width: LANE_W,
                  height: ROW_H,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.045)",
                  border: ativa ? `2px solid ${COLORS.accent}88` : "2px solid transparent",
                }}
              />
            </div>
          );
        })}

        {/* trilha de vídeo: clipe que é cortado em 4 */}
        {(() => {
          const k = pop(p.openAt + 0.25, 14);
          const gaps = CORTES.map((_, i) => 16 * ramp(p.cutAt + 0.15 + i * 0.3, p.cutAt + 0.3 + i * 0.3));
          const bordas = [0, ...CORTES, 1];
          return bordas.slice(0, -1).map((a, i) => {
            const b = bordas[i + 1];
            const esq = LANE_X + 8 + (LANE_W - 16) * a + (i > 0 ? gaps[i - 1] / 2 : 0);
            const dir = LANE_X + 8 + (LANE_W - 16) * b - (i < gaps.length ? gaps[i] / 2 : 0);
            return (
              <div
                key={a}
                style={{
                  position: "absolute",
                  left: esq,
                  top: rowTop(0) + 12,
                  width: (dir - esq) * k,
                  height: ROW_H - 24,
                  borderRadius: 10,
                  background: "repeating-linear-gradient(90deg, #4a4a55 0 34px, #3a3a44 34px 36px)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                }}
              />
            );
          });
        })()}

        {legendas.map((b) => (
          <Bloco key={b.at} {...b} row={1} cor={COLORS.accent} />
        ))}
        {motions.map((b) => (
          <Bloco key={b.at} {...b} row={2} cor={`linear-gradient(90deg, ${COLORS.accent}, #FFB800)`} borda="2px solid #fff6" />
        ))}
        {efeitos.map((b) => (
          <Bloco key={b.at} {...b} row={3} cor="rgba(255,255,255,0.85)" />
        ))}

        {/* agulha */}
        {t >= p.cutAt && (
          <div
            style={{
              position: "absolute",
              left: LANE_X + LANE_W * prog - 2,
              top: ROW_Y - 22,
              width: 4,
              height: 4 * (ROW_H + ROW_GAP) + 10,
              background: COLORS.accent,
              boxShadow: `0 0 18px ${COLORS.accent}`,
              opacity: pronto ? 0 : 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -10,
                top: -12,
                width: 24,
                height: 16,
                background: COLORS.accent,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
          </div>
        )}

        {/* barra de progresso + status */}
        <div style={{ position: "absolute", left: 336, top: 512, width: 644, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 7, background: COLORS.accent, boxShadow: `0 0 16px ${COLORS.accent}` }} />
        </div>
        <div style={{ position: "absolute", left: 336, top: 540, ...texto(28, 600, pronto ? COLORS.accent : COLORS.muted) }}>{status}</div>
      </div>

      {/* final */}
      {pronto && (
        <>
          <Bloom x={540} y={660} w={800} h={300} forca={1.4} />
          <Shockwave t={t} at={p.doneAt} x={540} y={660} raio={420} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", justifyContent: "center" }}>
        <Carimbo t={t} at={p.doneAt} size={48}>
          <Icon name="check" size={48} color={COLORS.ink} stroke={3.4} />
          {p.doneLabel ?? "PRONTO"}
        </Carimbo>
      </div>
    </Area>
  );
};
