import { Easing, interpolate } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, clamp, Digitando, Shockwave, texto, useCena, vidro } from "./kit";

// Arquivo → IA → pergunta: o cartão do vídeo aparece, desliza e voa para dentro de um núcleo de IA
// (absorção com shockwave); depois o núcleo sobe e "fala" num balão digitado.
export type AiPipelineProps = {
  start: number;
  fileAt: number;
  fileName: string;
  fileSub?: string;
  sendAt: number; // o arquivo vai para a IA (voo termina ~1s depois)
  aiLabel?: string;
  askAt: number;
  askText: string;
};

const ORB = 210;

export const AiPipeline: React.FC<AiPipelineProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const absorve = p.sendAt + 1.0;

  // Cartão do arquivo: entra no centro → desliza para a esquerda → voa em arco até o núcleo
  const arq = pop(p.fileAt, 13);
  const desliza = ramp(p.sendAt, p.sendAt + 0.35);
  const voo = ramp(p.sendAt + 0.45, absorve, Easing.in(Easing.cubic));
  const cardX = 540 - 280 * desliza + 530 * voo;
  const cardY = 330 - 150 * Math.sin(Math.PI * voo);
  const cardEsc = (0.6 + 0.4 * arq) * (1 - 0.75 * voo);
  const cardOp = Math.min(1, arq * 2) * interpolate(voo, [0.75, 1], [1, 0], clamp);

  // Núcleo de IA
  const ia = pop(p.sendAt + 0.1, 12);
  const sobe = ramp(p.askAt - 0.1, p.askAt + 0.45);
  const orbX = 790 - 250 * sobe;
  const orbY = 330 - 165 * sobe;
  const orbEsc = ia * (1 - 0.32 * sobe);
  const engole = interpolate(t, [absorve, absorve + 0.12, absorve + 0.45], [0, 1, 0], clamp);
  const balao = pop(p.askAt + 0.3, 13);

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pop" at={p.fileAt} volume={0.35} />
      <Som nome="whoosh" at={p.sendAt + 0.45} volume={0.35} />
      <Som nome="rise" at={p.sendAt + 0.1} volume={0.25} />
      <Som nome="ding" at={absorve} volume={0.4} />
      <Som nome="swoosh-up" at={p.askAt - 0.1} volume={0.25} />
      <Som nome="pluck" at={p.askAt + 0.3} volume={0.35} />

      {/* Núcleo */}
      {ia > 0.01 && (
        <>
          <Bloom x={orbX} y={orbY} w={560 * orbEsc} h={560 * orbEsc} forca={1 + engole * 1.5} />
          <Shockwave t={t} at={absorve} x={orbX} y={orbY} raio={330} />
          <div
            style={{
              position: "absolute",
              left: orbX,
              top: orbY,
              transform: `translate(-50%, -50%) scale(${orbEsc * (1 + 0.12 * engole)})`,
            }}
          >
            {/* anel girando */}
            <div
              style={{
                position: "absolute",
                left: ORB / 2 - 150,
                top: ORB / 2 - 150,
                width: 300,
                height: 300,
                borderRadius: 999,
                border: `4px dashed ${COLORS.accent}99`,
                transform: `rotate(${t * 70}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: ORB / 2 - 128,
                top: ORB / 2 - 128,
                width: 256,
                height: 256,
                borderRadius: 999,
                border: `2px solid ${COLORS.accent}44`,
                transform: `rotate(${-t * 40}deg)`,
                borderTopColor: COLORS.accent,
              }}
            />
            <div
              style={{
                width: ORB,
                height: ORB,
                borderRadius: 999,
                background: `radial-gradient(circle at 35% 30%, #FFF3A6, ${COLORS.accent} 45%, #B38F00 100%)`,
                boxShadow: `0 0 ${70 + 80 * engole}px ${COLORS.accent}, inset 0 -12px 30px rgba(0,0,0,0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="sparkles" size={110} color={COLORS.ink} stroke={2.2} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: ORB + 34, display: "flex", justifyContent: "center", opacity: 1 - sobe }}>
              <div style={{ ...texto(34, 900, COLORS.accent), letterSpacing: 4, whiteSpace: "nowrap" }}>{p.aiLabel ?? "IA"}</div>
            </div>
          </div>
        </>
      )}

      {/* Cartão do vídeo */}
      {cardOp > 0.01 && (
        <div
          style={{
            ...vidro,
            position: "absolute",
            left: cardX,
            top: cardY,
            width: 400,
            padding: 18,
            transform: `translate(-50%, -50%) scale(${cardEsc}) rotate(${-3 + 3 * arq + 25 * voo}deg)`,
            opacity: cardOp,
          }}
        >
          <div
            style={{
              height: 200,
              borderRadius: 20,
              background: "linear-gradient(160deg, #2a2a32, #111115)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ width: "38%", height: "100%", background: COLORS.accent }} />
            </div>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                background: COLORS.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${COLORS.accent}88`,
              }}
            >
              <Icon name="play" size={46} color={COLORS.ink} stroke={2.6} />
            </div>
          </div>
          <div style={{ marginTop: 16, ...texto(36, 800), whiteSpace: "nowrap" }}>{p.fileName}</div>
          {p.fileSub && <div style={{ marginTop: 6, ...texto(26, 500, COLORS.muted), whiteSpace: "nowrap" }}>{p.fileSub}</div>}
        </div>
      )}

      {/* Balão da IA */}
      {balao > 0.01 && (
        <div
          style={{
            ...vidro,
            position: "absolute",
            left: 540,
            top: 450,
            width: 820,
            padding: "28px 34px",
            border: `3px solid ${COLORS.accent}`,
            transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * balao})`,
            transformOrigin: "50% 0",
            opacity: balao,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -18,
              width: 32,
              height: 32,
              background: "#202026",
              borderLeft: `3px solid ${COLORS.accent}`,
              borderTop: `3px solid ${COLORS.accent}`,
              transform: "translateX(-50%) rotate(45deg)",
            }}
          />
          <Icon name="comment" size={50} color={COLORS.accent} stroke={2.4} />
          <div style={{ ...texto(44, 800) }}>
            <Digitando t={t} at={p.askAt + 0.55} texto={p.askText} porLetra={0.04} />
          </div>
        </div>
      )}
    </Area>
  );
};
