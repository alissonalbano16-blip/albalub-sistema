import type { Caption } from "@remotion/captions";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "./Captions";
import { Overlays, type Overlay } from "./Overlays";
import { blocosSplit, Divisoria, progressoSplit, SplitCtx, SplitPanel, type Scene } from "./Split";
import { COLORS, MARCA } from "./theme";
import { ZoomVideo } from "./ZoomVideo";

export type ReelsConfig = {
  video: string;
  captions: string;
  durationSec: number;
  overlays: Overlay[];
  scenes?: Scene[];
};

export type ReelsProps = {
  projeto: string;
  config?: ReelsConfig;
  captions?: Caption[];
};

const BarraProgresso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "rgba(0,0,0,0.35)" }}>
      <div
        style={{
          width: `${(frame / durationInFrames) * 100}%`,
          height: "100%",
          background: COLORS.accent,
        }}
      />
    </div>
  );
};

export const Reels: React.FC<ReelsProps> = ({ config, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!config || !captions) return null;

  const scenes = config.scenes ?? [];
  const split = progressoSplit(frame / fps, blocosSplit(scenes));

  // Zoom-soco quando entra número, título, etapa ou a quebra de crença
  const socos = config.overlays
    .filter((o) => ["counter", "headline", "title", "roadmap", "stage", "crack", "cta"].includes(o.type))
    .map((o) => o.start);

  return (
    <SplitCtx.Provider value={split}>
      <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
        <SplitPanel scenes={scenes} />
        <ZoomVideo src={config.video} captions={captions} socos={socos} />
        {/* Vinheta sutil + escurece topo e base para os textos */}
        <AbsoluteFill
          style={{
            opacity: 1 - split.p,
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%), " +
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 22%, transparent 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        <Overlays overlays={config.overlays} />
        <Divisoria />
        <Captions captions={captions} />
        {MARCA.barraProgresso && <BarraProgresso />}
      </AbsoluteFill>
    </SplitCtx.Provider>
  );
};
