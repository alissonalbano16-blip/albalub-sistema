import { Easing, interpolate } from "remotion";
import { Icon, type IconName } from "../Icons";
import { COLORS } from "../theme";
import { Area, clamp, texto, useCena, vidro } from "./kit";

// Lista de opções/exemplos entrando uma a uma (ex.: o que mandar no direct) + carimbo final
export type OptionsProps = {
  start: number;
  header: string;
  headerIcon?: IconName;
  items: { icon: IconName; title: string; sub: string; at: number }[];
  footer?: string;
  footerAt?: number;
};

export const Options: React.FC<OptionsProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const cab = pop(p.start, 13);
  const carimbo =
    p.footerAt === undefined
      ? 0
      : interpolate(t, [p.footerAt, p.footerAt + 0.18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const altura = p.items.length > 3 ? 116 : 140;

  return (
    <Area style={{ opacity: saida }}>
      {p.items.map((it) => (
        <Som key={it.at} nome="pop" at={it.at} volume={0.35} />
      ))}
      {p.footerAt !== undefined && <Som nome="ding" at={p.footerAt} volume={0.35} />}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${(1 - cab) * -50}px)`,
          opacity: cab,
        }}
      >
        <div
          style={{
            ...vidro,
            borderRadius: 999,
            padding: "14px 34px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Icon name={p.headerIcon ?? "send"} size={38} color={COLORS.accent} stroke={2.4} />
          <span style={texto(36, 800)}>{p.header}</span>
        </div>
      </div>

      {p.items.map((it, i) => {
        const e = pop(it.at, 12);
        const ativo = t >= it.at && (i === p.items.length - 1 || t < p.items[i + 1].at);
        return (
          <div
            key={it.title}
            style={{
              ...vidro,
              position: "absolute",
              left: 110,
              width: 860,
              top: 100 + i * (altura + 20),
              height: altura,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 24px",
              transform: `translateX(${(1 - e) * 1100}px) scale(${ativo ? 1.03 : 1})`,
              opacity: Math.min(1, e * 3),
              border: ativo ? `3px solid ${COLORS.accent}` : vidro.border,
            }}
          >
            <div
              style={{
                width: altura - 40,
                height: altura - 40,
                borderRadius: 26,
                background: COLORS.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={it.icon} size={(altura - 40) * 0.55} color={COLORS.ink} stroke={2.3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={texto(40, 800)}>{it.title}</div>
              <div style={{ ...texto(28, 500, COLORS.muted), marginTop: 6 }}>{it.sub}</div>
            </div>
            <Icon name="link" size={44} color={COLORS.accent} stroke={2.4} />
          </div>
        );
      })}

      {p.footer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 100 + p.items.length * (altura + 20) + 10,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${2 - carimbo}) rotate(-4deg)`,
            opacity: carimbo,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 30px",
              borderRadius: 16,
              background: COLORS.accent,
              boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 40px ${COLORS.accent}55`,
              ...texto(44, 900, COLORS.ink),
            }}
          >
            <Icon name="check" size={44} color={COLORS.ink} stroke={3.4} />
            {p.footer}
          </div>
        </div>
      )}
    </Area>
  );
};
