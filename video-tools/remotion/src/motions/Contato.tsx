import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, Carimbo, Ladrilho, Shockwave, texto, useCena, vidro } from "./kit";

// Cartões de contato: WhatsApp (número grande) e PIX (chave + nome do titular), com carimbo opcional.
// Para: "fala comigo", "me chama no WhatsApp", "doe pelo PIX".
export type ContatoProps = {
  start: number;
  whatsapp: string; // ex.: "(85) 98179-6430"
  whatsAt: number;
  pixChave?: string;
  pixNome?: string;
  pixAt?: number;
  selo?: string;
  seloAt?: number;
};

const Cartao: React.FC<{
  y: number;
  k: number;
  ativo: boolean;
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  sub?: string;
}> = ({ y, k, ativo, icone, rotulo, valor, sub }) => (
  <div
    style={{
      ...vidro,
      position: "absolute",
      left: 70,
      width: 940,
      top: y,
      height: sub ? 230 : 200,
      display: "flex",
      alignItems: "center",
      gap: 36,
      padding: "0 44px",
      boxSizing: "border-box",
      border: ativo ? `3px solid ${COLORS.accent}` : vidro.border,
      boxShadow: ativo ? `${vidro.boxShadow}, 0 0 50px ${COLORS.accent}44` : vidro.boxShadow,
      opacity: k,
      transform: `translateX(${(1 - k) * 160}px) scale(${0.9 + 0.1 * k})`,
    }}
  >
    <Ladrilho size={128} ativo={ativo}>
      {icone}
    </Ladrilho>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div style={{ ...texto(34, 700, COLORS.muted), letterSpacing: 2 }}>{rotulo}</div>
      <div style={{ ...texto(66, 900, ativo ? COLORS.accent : COLORS.text), whiteSpace: "nowrap" }}>{valor}</div>
      {sub && <div style={{ ...texto(32, 600), whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  </div>
);

const Pix: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ ...texto(size * 0.5, 900, color), letterSpacing: 1 }}>PIX</div>
);

export const Contato: React.FC<ContatoProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const temPix = p.pixAt !== undefined && p.pixChave;
  const yWhats = temPix ? 60 : 220;
  const yPix = 300;
  const kW = pop(p.whatsAt, 12);
  const kP = temPix ? pop(p.pixAt!, 12) : 0;
  const pixAtivo = !!temPix && t >= p.pixAt!;

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="pop" at={p.whatsAt} volume={0.35} />
      {temPix && <Som nome="coins" at={p.pixAt!} volume={0.3} />}
      {p.selo && p.seloAt !== undefined && <Som nome="ding" at={p.seloAt} volume={0.35} />}

      <Bloom x={540} y={pixAtivo ? yPix + 115 : yWhats + 100} w={1000} h={320} forca={0.7} />
      <Shockwave t={t} at={p.whatsAt + 0.15} x={150} y={yWhats + 100} raio={260} aneis={2} />

      <Cartao
        y={yWhats}
        k={kW}
        ativo={!pixAtivo}
        icone={<Icon name="phone" size={70} color={COLORS.accent} stroke={2.2} />}
        rotulo="WHATSAPP"
        valor={p.whatsapp}
      />
      {temPix && (
        <Cartao
          y={yPix}
          k={kP}
          ativo={pixAtivo}
          icone={<Pix size={128} color={COLORS.accent} />}
          rotulo="CHAVE PIX"
          valor={p.pixChave!}
          sub={p.pixNome}
        />
      )}

      {p.selo && p.seloAt !== undefined && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center" }}>
          <Carimbo t={t} at={p.seloAt}>
            {p.selo}
          </Carimbo>
        </div>
      )}
    </Area>
  );
};
