import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, Digitando, Ladrilho, Shockwave, texto, useCena } from "./kit";

// Frase de impacto digitada no centro (1 ideia, grande), última letra piscando em amarelo,
// ladrilho de vidro com ícone e onda de choque. Ótimo para gancho, tese, "a verdade é que..."
export type StatementProps = {
  start: number;
  lines: { text: string; at: number; accent?: boolean }[];
  icon?: IconName;
  iconAt?: number;
  porLetra?: number; // segundos por letra (padrão 0.045)
};

export const Statement: React.FC<StatementProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const porLetra = p.porLetra ?? 0.045;
  const iconAt = p.iconAt ?? p.start + 0.1;
  const ic = pop(iconAt, 10);
  const maior = Math.max(...p.lines.map((l) => l.text.length));
  const size = Math.min(104, 980 / (maior * 0.56));
  const altLinhas = p.lines.length * size * 1.15;
  const topo = p.icon ? 380 - altLinhas / 2 + 40 : 360 - altLinhas / 2;
  const ativa = p.lines.reduce((acc, l, i) => (t >= l.at ? i : acc), -1);

  return (
    <Area style={{ opacity: saida }}>
      {p.icon && <Som nome="whip" at={iconAt} volume={0.3} />}
      {p.lines.flatMap((l) =>
        l.text
          .split("")
          .map((c, i) => (c !== " " && i % 2 === 0 ? <Som key={`${l.at}-${i}`} nome="tick" at={l.at + i * porLetra} volume={0.16} /> : null)),
      )}

      <Bloom x={540} y={topo + altLinhas / 2} w={1000} h={altLinhas + 260} forca={0.8} />

      {p.icon && (
        <>
          <Shockwave t={t} at={iconAt} x={540} y={115} raio={380} aneis={2} />
          <div style={{ position: "absolute", left: 540 - 75, top: 40, transform: `scale(${ic}) rotate(${(1 - ic) * -20}deg)` }}>
            <Ladrilho size={150} ativo>
              <Icon name={p.icon} size={80} color={COLORS.accent} stroke={2.2} />
            </Ladrilho>
          </div>
        </>
      )}

      <div style={{ position: "absolute", left: 40, right: 40, top: topo, textAlign: "center" }}>
        {p.lines.map((l, i) => (
          <div
            key={l.at}
            style={{
              ...texto(size, 900, l.accent ? COLORS.accent : COLORS.text),
              lineHeight: 1.15,
              minHeight: size * 1.15,
              textShadow: l.accent ? `0 0 30px ${COLORS.accent}88` : "0 0 24px rgba(255,255,255,0.18)",
            }}
          >
            <Digitando t={t} at={l.at} texto={l.text} porLetra={porLetra} cursor={i === ativa} />
          </div>
        ))}
      </div>
    </Area>
  );
};
