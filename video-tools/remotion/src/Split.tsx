import { createContext, useContext } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Belief, type BeliefProps } from "./motions/Belief";
import { BigNumber, type BigNumberProps } from "./motions/BigNumber";
import { Chart, type ChartProps } from "./motions/Chart";
import { Compare, type CompareProps } from "./motions/Compare";
import { OfferStack, type OfferStackProps } from "./motions/OfferStack";
import { Statement, type StatementProps } from "./motions/Statement";
import { Contato, type ContatoProps } from "./motions/Contato";
import { Timeline, type TimelineProps } from "./motions/Timeline";
import { CommentFunnel, type CommentFunnelProps } from "./motions/CommentFunnel";
import { Sfx } from "./motions/kit";
import { Options, type OptionsProps } from "./motions/Options";
import { Profile, type ProfileProps } from "./motions/Profile";
import { Reach, type ReachProps } from "./motions/Reach";
import { ShareNetwork, type ShareNetworkProps } from "./motions/ShareNetwork";
import { AiPipeline, type AiPipelineProps } from "./motions/AiPipeline";
import { EditorAuto, type EditorAutoProps } from "./motions/EditorAuto";
import { COLORS } from "./theme";

// Tela dividida: o vídeo desce para a metade de baixo e um motion ocupa a metade de cima.
export const SPLIT_Y = 900;
const TRANSICAO_S = 0.45;
const JUNTA_S = 0.6; // cenas com intervalo menor que isso ficam num bloco só (não "respira")

type SemStart<T> = Omit<T, "start">;
// layout "split" (padrão): vídeo embaixo, motion em cima. "full": motion em tela cheia, rosto numa bolha redonda embaixo.
export type Layout = "split" | "full";
export type Scene = { start: number; end: number; layout?: Layout } & (
  | ({ motion: "profile" } & SemStart<ProfileProps>)
  | ({ motion: "belief" } & SemStart<BeliefProps>)
  | ({ motion: "shareNetwork" } & SemStart<ShareNetworkProps>)
  | ({ motion: "commentFunnel" } & SemStart<CommentFunnelProps>)
  | ({ motion: "reach" } & SemStart<ReachProps>)
  | ({ motion: "options" } & SemStart<OptionsProps>)
  | ({ motion: "bigNumber" } & SemStart<BigNumberProps>)
  | ({ motion: "statement" } & SemStart<StatementProps>)
  | ({ motion: "compare" } & SemStart<CompareProps>)
  | ({ motion: "timeline" } & SemStart<TimelineProps>)
  | ({ motion: "chart" } & SemStart<ChartProps>)
  | ({ motion: "offerStack" } & SemStart<OfferStackProps>)
  | ({ motion: "aiPipeline" } & SemStart<AiPipelineProps>)
  | ({ motion: "editorAuto" } & SemStart<EditorAutoProps>)
  | ({ motion: "contato" } & SemStart<ContatoProps>)
);

const MOTIONS: { [K in Scene["motion"]]: React.FC<any> } = {
  profile: Profile,
  belief: Belief,
  shareNetwork: ShareNetwork,
  commentFunnel: CommentFunnel,
  reach: Reach,
  options: Options,
  bigNumber: BigNumber,
  statement: Statement,
  compare: Compare,
  timeline: Timeline,
  chart: Chart,
  offerStack: OfferStack,
  aiPipeline: AiPipeline,
  editorAuto: EditorAuto,
  contato: Contato,
};

type Bloco = { start: number; end: number; full: boolean };

export const blocosSplit = (scenes: Scene[]): Bloco[] => {
  const ordenadas = [...scenes].sort((a, b) => a.start - b.start);
  const blocos: Bloco[] = [];
  for (const s of ordenadas) {
    const ultimo = blocos[blocos.length - 1];
    const full = s.layout === "full";
    if (ultimo && ultimo.full === full && s.start - ultimo.end < JUNTA_S) ultimo.end = Math.max(ultimo.end, s.end);
    else blocos.push({ start: s.start, end: s.end, full });
  }
  return blocos;
};

// p: 0 = só o vídeo, 1 = painel de motion aberto. full: layout do bloco ativo.
export const progressoSplit = (t: number, blocos: Bloco[]) => {
  const ease = Easing.inOut(Easing.cubic);
  let p = 0;
  let full = false;
  for (const b of blocos) {
    const entra = Math.min(1, Math.max(0, (t - b.start) / TRANSICAO_S));
    const sai = Math.min(1, Math.max(0, (b.end - t) / TRANSICAO_S));
    const v = ease(Math.min(entra, sai));
    if (v > p) {
      p = v;
      full = b.full;
    }
  }
  return { p, full };
};

export const SplitCtx = createContext({ p: 0, full: false });
// Progresso do painel (0–1), qualquer layout
export const useSplit = () => useContext(SplitCtx).p;
// true quando o bloco ativo é "full" (rosto em bolha)
export const useFull = () => useContext(SplitCtx).full;

// Layout full: área dos motions ampliada e descida; rosto em bolha
export const FULL = { escala: 1.12, desce: 110, bolha: 340, bolhaY: 1520, legendaY: 1190 };

// Fundo do painel de cima: preto com grade de pontos e brilho amarelo
const FundoPainel: React.FC<{ altura: number }> = ({ altura }) => {
  const frame = useCurrentFrame();
  const deriva = (frame * 0.4) % 40;
  return (
    <AbsoluteFill style={{ height: altura, backgroundColor: "#060608", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 2px, transparent 2px)",
          backgroundSize: "40px 40px",
          backgroundPosition: `0 ${deriva}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 55%, ${COLORS.accent}22, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const SplitPanel: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const p = useSplit();
  const full = useFull();
  const { fps } = useVideoConfig();
  const blocos = blocosSplit(scenes);
  const altura = full ? 1920 : SPLIT_Y;
  return (
    <>
      {blocos.map((b) => (
        <Sequence key={b.start} from={Math.round(b.start * fps)} layout="none">
          <Sfx nome="whoosh" volume={0.35} />
          <Sfx nome="swoosh-up" at={b.end - b.start - TRANSICAO_S} volume={0.25} />
        </Sequence>
      ))}
      {p > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: altura * p, overflow: "hidden" }}>
          <FundoPainel altura={altura} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: full ? `translateY(${FULL.desce}px) scale(${FULL.escala})` : undefined,
              transformOrigin: "540px 140px",
            }}
          >
          {scenes.map((s) => {
            const { motion, end, layout: _l, ...props } = s;
            const Comp = MOTIONS[motion];
            return (
              <Sequence
                key={s.start}
                from={Math.round(s.start * fps)}
                durationInFrames={Math.max(1, Math.round((end - s.start) * fps))}
                layout="none"
              >
                <Comp {...props} />
              </Sequence>
            );
          })}
          </div>
        </div>
      )}
    </>
  );
};

// Linha da divisória com brilho
export const Divisoria: React.FC = () => {
  const p = useSplit();
  const full = useFull();
  if (p <= 0 || full) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: SPLIT_Y * p - 3,
        width: 1080 * interpolate(p, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        marginLeft: 540 - 540 * interpolate(p, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 6,
        background: COLORS.accent,
        boxShadow: `0 0 24px ${COLORS.accent}, 0 0 60px ${COLORS.accent}88`,
      }}
    />
  );
};
