import { Composition, staticFile } from "remotion";
import { Catalogo } from "./Catalogo";
import { catalogo } from "./demos";
import { Reels, type ReelsProps } from "./Reels";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reels"
        component={Reels}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{ projeto: "exemplo" } as ReelsProps}
        calculateMetadata={async ({ props }) => {
          // Projeto inexistente: abre vazio em vez de quebrar o Studio
          const config = await fetch(staticFile(`${props.projeto}/config.json`))
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
          if (!config) return { durationInFrames: FPS * 10, props };
          const captions = await fetch(staticFile(config.captions)).then((r) =>
            r.json(),
          );
          return {
            durationInFrames: Math.round(config.durationSec * FPS),
            props: { ...props, config, captions },
          };
        }}
      />
      <Composition
        id="Catalogo"
        component={Catalogo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={Math.round(catalogo().duracao * FPS)}
      />
    </>
  );
};
