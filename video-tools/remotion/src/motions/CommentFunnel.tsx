import { Easing, interpolate } from "remotion";
import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Avatar, clamp, texto, useCena, vidro } from "./kit";

// Pessoa digita a palavra-chave → comentário publicado → chega o link no direct → produto que resolve a dor
export type CommentFunnelProps = {
  start: number;
  keyword: string;
  typeAt: number;
  postAt: number;
  dmAt: number;
  link: string;
  productAt: number;
  product: string;
  productSub: string;
  solveAt: number;
  solveText: string;
};

const X = 130;
const W = 820;
const VERMELHO = "#FF3B5C";

export const CommentFunnel: React.FC<CommentFunnelProps> = (p) => {
  const { t, pop, ramp, saida, Som } = useCena(p.start);
  const entrada = pop(p.start, 13);
  const porLetra = 0.09;
  const digitadas = t < p.postAt ? Math.max(0, Math.min(p.keyword.length, Math.floor((t - p.typeAt) / porLetra) + 1)) : 0;
  const ultimaEm = p.typeAt + (digitadas - 1) * porLetra;
  const flashUltima = digitadas > 0 && t - ultimaEm < 0.15;
  const cursor = Math.floor(t * 3) % 2 === 0;
  const comentario = pop(p.postAt, 12);
  const curtida = pop(p.postAt + 0.45, 8);
  const dm = pop(p.dmAt, 12);
  const produto = pop(p.productAt, 11);
  const resolve = interpolate(t, [p.solveAt, p.solveAt + 0.18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });

  return (
    <Area style={{ opacity: saida }}>
      {p.keyword.split("").map((_, i) => (
        <Som key={i} nome="tick" at={p.typeAt + i * porLetra} volume={0.25} />
      ))}
      <Som nome="pop" at={p.postAt} volume={0.4} />
      <Som nome="pluck" at={p.postAt + 0.45} volume={0.3} />
      <Som nome="ding" at={p.dmAt} volume={0.35} />
      <Som nome="whoosh" at={p.productAt} volume={0.35} />
      <Som nome="coins" at={p.solveAt} volume={0.3} />

      {/* Caixa de comentário */}
      <div
        style={{
          ...vidro,
          position: "absolute",
          left: X,
          top: 0,
          width: W,
          height: 100,
          borderRadius: 50,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 22px",
          transform: `translateY(${(1 - entrada) * -60}px)`,
          opacity: entrada,
        }}
      >
        <Avatar size={62}>
          <Icon name="user" size={34} color={COLORS.ink} stroke={2.6} />
        </Avatar>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {digitadas > 0 ? (
            <span style={texto(42, 800)}>
              {p.keyword.slice(0, digitadas - (flashUltima ? 1 : 0))}
              {flashUltima && <span style={{ color: COLORS.accent }}>{p.keyword[digitadas - 1]}</span>}
            </span>
          ) : (
            <span style={texto(30, 500, COLORS.muted)}>Adicione um comentário...</span>
          )}
          {t < p.postAt && t >= p.typeAt && (
            <div style={{ width: 4, height: 46, marginLeft: 4, background: COLORS.accent, opacity: cursor ? 1 : 0 }} />
          )}
        </div>
        <span style={texto(30, 800, digitadas > 0 ? COLORS.accent : `${COLORS.accent}66`)}>Publicar</span>
      </div>

      {/* Comentário publicado */}
      <div
        style={{
          position: "absolute",
          left: X + 10,
          top: 130,
          width: W - 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `translateY(${(1 - comentario) * -50}px)`,
          opacity: comentario,
        }}
      >
        <Avatar size={70} destaque>
          <Icon name="user" size={38} color={COLORS.ink} stroke={2.6} />
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={texto(26, 600, COLORS.muted)}>@seguidora · agora</div>
          <div style={{ ...texto(44, 900), letterSpacing: 1 }}>{p.keyword}</div>
        </div>
        <div style={{ transform: `scale(${1 + 0.4 * curtida * (1 - curtida) * 4})` }}>
          <Icon name="heart" size={50} color={curtida > 0.5 ? VERMELHO : "#fff"} fill={curtida > 0.5 ? VERMELHO : "none"} stroke={2.2} />
        </div>
      </div>

      {/* Direct com o link */}
      <div style={{ position: "absolute", left: X, top: 270, width: W, opacity: dm, transform: `translateX(${(1 - dm) * 200}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Icon name="send" size={32} color={COLORS.accent} stroke={2.4} />
          <span style={texto(26, 700, COLORS.muted)}>Direct · agora</span>
        </div>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: 14,
            padding: "22px 28px",
            borderRadius: "34px 34px 34px 10px",
            background: "#2a2a31",
            boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
          }}
        >
          <span style={texto(32, 600)}>Aqui está o seu link:</span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 16,
              background: COLORS.accent,
              ...texto(32, 800, COLORS.ink),
            }}
          >
            <Icon name="link" size={34} color={COLORS.ink} stroke={2.6} />
            {p.link}
          </div>
        </div>
      </div>

      {/* Produto */}
      <div
        style={{
          ...vidro,
          position: "absolute",
          left: X,
          top: 500,
          width: W,
          height: 170,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "0 26px",
          border: `2px solid ${COLORS.accent}`,
          transform: `scale(${0.6 + 0.4 * produto})`,
          opacity: Math.min(1, produto * 2),
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 ${50 * ramp(p.solveAt, p.solveAt + 0.3)}px ${COLORS.accent}66`,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="package" size={70} color={COLORS.ink} stroke={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={texto(42, 800)}>{p.product}</div>
          <div style={{ ...texto(28, 500, COLORS.muted), marginTop: 6 }}>{p.productSub}</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: X - 30,
          top: 465,
          transform: `scale(${2 - resolve}) rotate(6deg)`,
          opacity: resolve,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px",
          borderRadius: 14,
          background: "#0b0b0d",
          border: `4px solid ${COLORS.accent}`,
          ...texto(32, 900, COLORS.accent),
        }}
      >
        <Icon name="check" size={34} color={COLORS.accent} stroke={3.4} />
        {p.solveText}
      </div>
    </Area>
  );
};
