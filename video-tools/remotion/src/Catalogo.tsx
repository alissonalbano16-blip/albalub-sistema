import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { catalogo } from "./demos";
import { texto } from "./motions/kit";
import { blocosSplit, Divisoria, progressoSplit, SPLIT_Y, SplitCtx, SplitPanel } from "./Split";
import { COLORS } from "./theme";

// Vitrine de todos os motions: painel de cima igual ao vídeo final, embaixo o nome e o uso.
export const Catalogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scenes, nomes } = catalogo();
  const split = progressoSplit(frame / fps, blocosSplit(scenes));

  return (
    <SplitCtx.Provider value={split}>
      <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
        <SplitPanel scenes={scenes} />
        {nomes.map((n, i) => (
          <Sequence key={n.nome} from={Math.round(n.start * fps)} durationInFrames={Math.round((n.end - n.start) * fps)} layout="none">
            <div style={{ position: "absolute", left: 0, right: 0, top: SPLIT_Y + 220, textAlign: "center" }}>
              <div style={texto(36, 700, COLORS.muted)}>
                {String(i + 1).padStart(2, "0")} / {String(nomes.length).padStart(2, "0")}
              </div>
              <div style={{ ...texto(110, 900, COLORS.accent), marginTop: 20 }}>{n.nome}</div>
              <div style={{ ...texto(44, 600), marginTop: 24 }}>{n.uso}</div>
            </div>
          </Sequence>
        ))}
        <Divisoria />
      </AbsoluteFill>
    </SplitCtx.Provider>
  );
};
