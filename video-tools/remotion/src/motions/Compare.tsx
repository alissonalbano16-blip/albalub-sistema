import { Icon } from "../Icons";
import { COLORS } from "../theme";
import { Area, Bloom, Carimbo, Shockwave, texto, useCena, VERMELHO, vidro } from "./kit";

// Comparação lado a lado: antes × depois, errado × certo, eles × você.
// Coluna da esquerda é a "ruim" (X vermelhos), da direita a "boa" (checks amarelos).
type Coluna = { title: string; at: number; items: { text: string; at: number }[] };

export type CompareProps = {
  start: number;
  left: Coluna;
  right: Coluna;
  verdict?: string;
  verdictAt?: number;
};

// Colunas simétricas em torno de x=540 com folga: no layout full a área é ampliada 1.12× a partir do centro
const LARG = 440;
const ESQ = 70;
const DIR = 570;
// Altura da coluna acompanha o número de itens; o conjunto fica centralizado na área
const altura = (n: number) => 130 + n * 92;
const topo = (n: number) => Math.max(10, (600 - altura(n)) / 2);

const ColunaView: React.FC<{ c: Coluna; lado: "left" | "right"; pop: (at: number, d?: number) => number; apagada: number; risco?: number; n: number }> = ({
  c,
  lado,
  pop,
  apagada,
  risco = 0,
  n,
}) => {
  const boa = lado === "right";
  const e = pop(c.at, 13);
  const cor = boa ? COLORS.accent : VERMELHO;
  return (
    <div
      style={{
        ...vidro,
        position: "absolute",
        left: boa ? DIR : ESQ,
        top: topo(n),
        width: LARG,
        height: altura(n),
        padding: "26px 26px",
        border: boa ? `3px solid ${COLORS.accent}` : vidro.border,
        boxShadow: boa ? `${vidro.boxShadow}, 0 0 60px ${COLORS.accent}33` : vidro.boxShadow,
        transform: `translateX(${(1 - e) * (boa ? 600 : -600)}px) scale(${1 - 0.04 * apagada})`,
        opacity: Math.min(1, e * 2) * (1 - 0.45 * apagada),
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: "8px 22px",
          borderRadius: 999,
          background: boa ? COLORS.accent : "rgba(255,59,48,0.16)",
          border: boa ? undefined : `2px solid ${VERMELHO}`,
          ...texto(32, 900, boa ? COLORS.ink : VERMELHO),
          letterSpacing: 1,
        }}
      >
        {c.title}
      </div>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 32 }}>
        {c.items.map((it) => {
          const k = pop(it.at, 12);
          return (
            <div
              key={it.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: k,
                transform: `translateY(${(1 - k) * 24}px)`,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 999,
                  flexShrink: 0,
                  background: boa ? COLORS.accent : "rgba(255,59,48,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${0.4 + 0.6 * k})`,
                }}
              >
                <Icon name={boa ? "check" : "x"} size={36} color={boa ? COLORS.ink : cor} stroke={3.4} />
              </div>
              <span style={{ position: "relative", ...texto(38, boa ? 800 : 600, boa ? COLORS.text : "rgba(255,255,255,0.75)") }}>
                {it.text}
                {risco > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: -4,
                      top: "52%",
                      height: 5,
                      borderRadius: 3,
                      width: `calc(${risco * 100}% + 8px)`,
                      background: VERMELHO,
                    }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Compare: React.FC<CompareProps> = (p) => {
  const { t, pop, saida, Som } = useCena(p.start);
  const n = Math.max(p.left.items.length, p.right.items.length);
  const vs = pop(p.right.at - 0.15, 9);
  // A coluna "ruim" apaga um pouco quando a "boa" entra
  const apagada = Math.min(1, Math.max(0, (t - p.right.at) / 0.4)) * 0.7;
  // ...e os itens dela ganham um risco vermelho
  const risco = Math.min(1, Math.max(0, (t - p.right.at - 0.2) / 0.35));
  const brilho = pop(p.right.at, 14);

  return (
    <Area style={{ opacity: saida }}>
      <Som nome="whoosh" at={p.left.at} volume={0.25} />
      {p.left.items.map((it) => (
        <Som key={it.at} nome="whip" at={it.at} volume={0.22} />
      ))}
      <Som nome="whoosh" at={p.right.at} volume={0.3} />
      <Som nome="whip" at={p.right.at + 0.2} volume={0.2} />
      {p.right.items.map((it) => (
        <Som key={it.at} nome="pop" at={it.at} volume={0.32} />
      ))}
      {p.verdictAt !== undefined && <Som nome="ding" at={p.verdictAt} volume={0.4} />}

      {brilho > 0.01 && <Bloom x={DIR + LARG / 2} y={topo(n) + altura(n) / 2} w={560 * brilho} h={(altura(n) + 160) * brilho} forca={0.9} />}
      <ColunaView c={p.left} lado="left" pop={pop} apagada={apagada} risco={risco} n={n} />
      <ColunaView c={p.right} lado="right" pop={pop} apagada={0} n={n} />

      {/* VS no meio */}
      <div
        style={{
          position: "absolute",
          left: 540 - 46,
          top: topo(n) + altura(n) / 2 - 46,
          width: 92,
          height: 92,
          borderRadius: 999,
          background: "#0b0b0e",
          border: `3px solid ${COLORS.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${vs}) rotate(${(1 - vs) * 180}deg)`,
          boxShadow: `0 0 30px ${COLORS.accent}66`,
          ...texto(34, 900, COLORS.accent),
        }}
      >
        vs
      </div>

      {p.verdictAt !== undefined && <Shockwave t={t} at={p.verdictAt} x={540} y={topo(n) + altura(n) + 80} raio={380} />}
      {p.verdict && p.verdictAt !== undefined && (
        <div style={{ position: "absolute", left: 0, right: 0, top: topo(n) + altura(n) + 34, display: "flex", justifyContent: "center" }}>
          <Carimbo t={t} at={p.verdictAt}>
            <Icon name="check" size={44} color={COLORS.ink} stroke={3.4} />
            {p.verdict}
          </Carimbo>
        </div>
      )}
    </Area>
  );
};
