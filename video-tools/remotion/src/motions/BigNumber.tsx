import { Easing, interpolate } from "remotion";
import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, clamp, fmtNum, Ladrilho, Selo, Shockwave, texto, useCena } from "./kit";

// Número gigante contando, com brilho (bloom) e onda de choque quando trava no valor final
export type BigNumberProps = {
  start: number;
  value: number;
  prefix?: string; // "R$", "+"
  suffix?: string; // "%", "x", " mil"
  casas?: number; // casas decimais
  compacto?: boolean; // 180000 -> "180 mil"
  countAt: number;
  countEnd: number;
  icon?: IconName;
  label?: string;
  labelAt?: number;
};

export const BigNumber: React.FC<BigNumberProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const k = interpolate(t, [p.countAt, p.countEnd], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const travou = t >= p.countEnd;
  const valor = fmtNum(p.value * k, p.compacto, p.casas ?? 0);
  const final = fmtNum(p.value, p.compacto, p.casas ?? 0);
  const textoFinal = `${p.prefix ?? ""}${final}${p.suffix ?? ""}`;
  const size = Math.min(240, 980 / (textoFinal.length * 0.6));
  const entra = pop(p.start + 0.05, 12);
  const soco = travou ? 1 + 0.14 * Math.exp(-(t - p.countEnd) * 7) : 1;
  const tremor = !travou && t > p.countAt ? Math.sin(t * 90) * 2 : 0;
  const labelAt = p.labelAt ?? p.countEnd + 0.25;
  const selo = pop(labelAt, 12);
  const temIcone = !!p.icon;
  const yNum = temIcone ? 380 : 320;
  const dinheiro = (p.prefix ?? "").includes("R$");

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="rise" at={p.countAt} volume={0.3} />
      <Som nome={dinheiro ? "coins" : "ding"} at={p.countEnd} volume={0.45} />
      {p.label && <Som nome="pop" at={labelAt} volume={0.3} />}

      <Bloom x={540} y={yNum} w={1000} h={460} forca={0.6 + k * 1.4 + (soco - 1) * 6} />
      <Shockwave t={t} at={p.countEnd} x={540} y={yNum} raio={520} />

      {temIcone && (
        <div
          style={{
            position: "absolute",
            left: 540 - 65,
            top: 40,
            transform: `scale(${entra}) translateY(${(1 - entra) * 40}px)`,
          }}
        >
          <Ladrilho size={130} ativo={travou}>
            <Icon name={p.icon!} size={70} color={COLORS.accent} stroke={2.2} />
          </Ladrilho>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: yNum - size * 0.6,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          transform: `scale(${(0.7 + 0.3 * entra) * soco}) translateX(${tremor}px)`,
          opacity: entra,
          ...texto(size, 900, travou ? COLORS.accent : COLORS.text),
          letterSpacing: -size * 0.03,
          textShadow: travou ? `0 0 40px ${COLORS.accent}aa, 0 0 100px ${COLORS.accent}55` : "0 0 30px rgba(255,255,255,0.25)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {p.prefix && <span style={{ fontSize: size * 0.5, marginRight: size * 0.08 }}>{p.prefix}</span>}
        {valor}
        {p.suffix && <span style={{ fontSize: size * 0.5, marginLeft: size * 0.04 }}>{p.suffix}</span>}
      </div>

      {p.label && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: yNum + size * 0.62 + 30,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${selo}) translateY(${(1 - selo) * 30}px)`,
          }}
        >
          <Selo>{p.label}</Selo>
        </div>
      )}
    </Area>
  );
};
