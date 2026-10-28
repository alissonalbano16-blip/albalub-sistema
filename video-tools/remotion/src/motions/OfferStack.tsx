import { Easing, interpolate } from "remotion";
import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, clamp, fmtNum, Shockwave, texto, useCena, VERMELHO, vidro } from "./kit";

// Empilhamento de oferta (VSL/lançamento): itens com valor entrando, soma total,
// total riscado em vermelho e o preço real explodindo grande.
export type OfferStackProps = {
  start: number;
  items: { label: string; value: number; at: number; icon?: IconName }[];
  totalAt: number;
  totalLabel?: string;
  priceAt: number;
  price: number;
  priceLabel?: string; // "hoje por apenas"
  prefix?: string; // "R$"
  sufixoPreco?: string; // "/mês", "ou 12x de R$ 29"
};

export const OfferStack: React.FC<OfferStackProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const prefix = p.prefix ?? "R$ ";
  const n = p.items.length;
  const alt = n > 4 ? 70 : 84;
  const gap = 12;
  const soma = p.items.reduce((a, i) => a + i.value, 0);
  const totalY = n * (alt + gap) + 6;
  const tot = pop(p.totalAt, 12);
  const risco = interpolate(t, [p.priceAt, p.priceAt + 0.25], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const preco = pop(p.priceAt + 0.15, 9, 180);
  const apaga = interpolate(t, [p.priceAt, p.priceAt + 0.4], [0, 1], clamp);
  const precoY = totalY + alt + 30;

  return (
    <Area style={{ opacity: saida }}>
      {p.items.map((it) => (
        <Som key={it.at} nome="pop" at={it.at} volume={0.32} />
      ))}
      <Som nome="ding" at={p.totalAt} volume={0.35} />
      <Som nome="whip" at={p.priceAt} volume={0.35} />
      <Som nome="coins" at={p.priceAt + 0.15} volume={0.45} />

      {p.items.map((it, i) => {
        const e = pop(it.at, 13);
        return (
          <div
            key={it.label}
            style={{
              ...vidro,
              borderRadius: 22,
              position: "absolute",
              left: 90,
              width: 900,
              top: i * (alt + gap),
              height: alt,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 28px",
              transform: `translateX(${(1 - e) * 900}px)`,
              opacity: 1 - 0.5 * apaga,
            }}
          >
            <Icon name={it.icon ?? "check"} size={36} color={COLORS.accent} stroke={2.8} />
            <span style={{ ...texto(alt > 75 ? 34 : 30, 700), flex: 1 }}>{it.label}</span>
            <span style={texto(alt > 75 ? 34 : 30, 800, COLORS.muted)}>
              {prefix}
              {fmtNum(it.value)}
            </span>
          </div>
        );
      })}

      {/* Total */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: totalY,
          height: alt,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderTop: "2px dashed rgba(255,255,255,0.25)",
          opacity: tot * (1 - 0.3 * apaga),
          transform: `translateY(${(1 - tot) * 20}px)`,
        }}
      >
        <span style={texto(36, 800, COLORS.muted)}>{p.totalLabel ?? "valor total"}</span>
        <span style={{ position: "relative", ...texto(46, 900) }}>
          {prefix}
          {fmtNum(Math.round(soma * Math.min(1, tot * 1.2)))}
          <div
            style={{
              position: "absolute",
              left: -8,
              top: "52%",
              height: 7,
              width: `calc(${risco * 100}% + 16px)`,
              background: VERMELHO,
              borderRadius: 4,
              transform: "rotate(-6deg)",
              boxShadow: `0 0 14px ${VERMELHO}`,
            }}
          />
        </span>
      </div>

      {/* Preço real */}
      {t >= p.priceAt && (
        <>
          <Bloom x={540} y={precoY + 70} w={900} h={300} forca={1.6} />
          <Shockwave t={t} at={p.priceAt + 0.15} x={540} y={precoY + 70} raio={480} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: precoY,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${0.4 + 0.6 * preco})`,
              opacity: Math.min(1, preco * 2),
            }}
          >
            <span style={texto(32, 700, COLORS.text)}>{p.priceLabel ?? "hoje por apenas"}</span>
            <span
              style={{
                ...texto(110, 900, COLORS.accent),
                textShadow: `0 0 40px ${COLORS.accent}aa, 0 0 100px ${COLORS.accent}55`,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 56 }}>{prefix}</span>
              {fmtNum(p.price)}
              {p.sufixoPreco && <span style={{ fontSize: 40, marginLeft: 8 }}>{p.sufixoPreco}</span>}
            </span>
          </div>
        </>
      )}
    </Area>
  );
};
