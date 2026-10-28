# Direção de edição — playbook

Como transformar uma fala para câmera numa edição "fora da curva". Leia antes de montar o beat sheet.

## 1. Os 5 princípios

1. **O motion ilustra a frase daquele segundo.** Se a pessoa diz "180 mil seguidores", o número aparece na sílaba do "180". Nada de decoração genérica: cada elemento entra no tempo da palavra (`frases.js --palavras`).
2. **Uma ideia por beat, grande e centralizada.** Um número, uma frase, uma comparação. Se precisar de duas ideias, são dois beats (duas fases ou duas cenas).
3. **Luz é o assunto.** Fundo preto, o que importa brilha: bloom atrás de números, anéis de shockwave quando algo "trava", ponto de luz viajando, borda na cor de destaque no item ativo. Cinza/branco no resto.
4. **Ritmo = contraste.** Alternar rosto cheio ↔ split ↔ full ↔ rosto. Nunca mais de ~8s sem uma mudança visual (corte de zoom, overlay, cena, leak). Também nunca mais de 3 eventos visuais no mesmo segundo.
5. **O som vende o movimento.** Todo movimento importante tem som (já embutido nos componentes). Volume sempre abaixo da voz (0.2–0.5).

## 2. Escolhendo o tratamento por tipo de fala

| A fala é... | Exemplo | Tratamento |
|---|---|---|
| Gancho com número | "vendi 30 mil sem anúncio" | rosto cheio + overlay `counter` (primeiros 3s **sem** split) |
| Gancho com tese/segredo | "ninguém te conta isso" | overlay `title` (lock) — ou `statement` em **full** a partir de ~2s |
| Gancho com promessa/resultado | "editei com IA em 15 min sem gastar" | overlay `headline` (2–3 linhas, faixa amarela, selo) — se houver PiP/inserção no canto, `side: "right"` + `centerAt` quando ela some |
| Número/resultado no meio | "faturou 180 mil" | `bigNumber` (split ou full) |
| Crescimento no tempo | "em 6 meses saiu de 3 para 30 mil" | `chart` |
| Prova social de perfil | "ganhou 180 mil seguidores" | `profile` |
| Comparação / antes × depois | "a maioria faz X, quem vende faz Y" | `compare` |
| Mudança de mentalidade | "quebre essa crença" | `belief` |
| Método em passos / jornada | "primeiro... depois... por fim" | `timeline` (ou `roadmap`+`stage` se o vídeo inteiro é organizado em etapas) |
| Lista de exemplos | "pode ser um PDF, uma aula, um vídeo" | `options` |
| Mecanismo de distribuição | "ela manda para uma amiga" | `shareNetwork` |
| Automação / palavra-chave | "comenta X que eu te mando" | `commentFunnel` |
| Entregar algo para a IA/ferramenta | "pega o arquivo e joga na IA" | `aiPipeline` |
| Processo que se faz sozinho | "ela começa a edição completa" | `editorAuto` |
| Algoritmo / alcance | "o Instagram entrega para mais gente" | `reach` |
| Oferta (VSL) | "tudo isso valeria R$ 3 mil..." | `offerStack` (**full**) |
| Frase forte / punchline | "é aqui que a maioria erra" | `statement` curto ou overlay `title` + emoji (raro) |
| Emoção, história pessoal, opinião | "eu chorei quando..." | **rosto cheio**, só legenda + zoom. Não cubra emoção com motion. |
| CTA | "comenta QUERO" | overlay `cta` em rosto cheio |

Se nada encaixa: **crie um motion novo** (ver componentes.md). Exemplos que valem criar quando aparecerem: calendário/rotina, mapa/cidades, conversa de WhatsApp, checkout/notificação de venda, termômetro/medidor, pirâmide/funil em camadas.

## 3. Split × Full × Rosto

| Layout | Quando | Duração |
|---|---|---|
| **Rosto cheio** | gancho, emoção, opinião, CTA, transições entre ideias | sempre ≥ 35% do vídeo |
| **Split** (`layout` omitido) | explicação de mecanismo/processo enquanto a pessoa fala — rosto continua presente | 5–15s |
| **Full** (`"layout": "full"`) | o visual É a mensagem: número gigante, oferta, frase de impacto, gráfico. Rosto vira bolha | 3–8s, no máx. 2–3 por vídeo |

- Densidade em ~2 min: conforme a intensidade do `perfil.md` (tabela no SKILL.md §4; equilibrado = 4–6 cenas, ≈ 1 a cada 20–25s).
- Duas cenas seguidas do **mesmo layout** com intervalo < 0.6s viram um bloco (o painel não fecha). Use isso para "capítulos" visuais longos.
- Split → full direto é permitido (troca de bloco), mas dê ≥ 1s de rosto entre blocos sempre que possível para respirar.
- Abra a cena 0.3–0.5s **antes** da palavra que ela ilustra; feche ~0.3s depois da última frase relacionada.

## 4. Estrutura de retenção (Reels 30–90s / ~2min)

1. **0–3s gancho**: rosto + overlay forte (counter/title) + leak no frame 0. Zoom soco no número.
2. **3–10s promessa**: o que a pessoa vai ganhar. Pode ter o primeiro motion (statement/bigNumber em full se o gancho foi rosto).
3. **Corpo**: cada pilar/etapa = (fala de abertura em rosto) → (cena split ilustrando o mecanismo) → (punchline em rosto/overlay). Leak em cada virada de etapa.
4. **Pico** perto de 70–80% do vídeo: o motion mais elaborado (ex.: commentFunnel + reach no mesmo bloco).
5. **CTA**: rosto cheio + `cta`. Nada de split.

## 5. VSL (3–15 min)

- Mesmos componentes, densidade menor: 1 cena a cada 30–45s; mais tempo de rosto (confiança).
- Use `roadmap`/`stage` para os blocos clássicos (problema → descoberta → mecanismo → prova → oferta → garantia).
- Prova: `chart`, `bigNumber`, `profile` em sequência (bloco único).
- Oferta: `offerStack` em **full**, seguido de `bigNumber` para o preço/parcela se for falado separado.
- Garantia: `statement` com ícone `shield`.
- Evite emojis em VSL (tom mais sério); leaks só nas viradas de bloco.

## 6. SFX e música

- Componentes já trazem sons; não duplique um som num mesmo instante (ex.: overlay counter + bigNumber).
- Entrada de bloco = whoosh, saída = swoosh-up (automático).
- Se o usuário trouxer música: volume ~0.08–0.12 com `<Audio>` em `Reels.tsx`, e baixe para ~0.05 durante falas importantes (não implementado por padrão — adicionar se pedido).

## 7. Texto dentro dos motions

- Curto: rótulos ≤ 14–18 caracteres, títulos ≤ 22. Corte palavras de enchimento ("você vai conseguir ter" → "resultado").
- Números sempre no formato BR (`fmtNum`): "30.000", "180 mil", "R$ 497".
- Português correto com acento (CRENÇA, ANÚNCIO). Caixa alta só em selos/carimbos.
- Nunca repetir literalmente a legenda dentro do motion — o motion **resume** ou **mostra**; a legenda já transcreve.

## 8. Checklist de QA (antes do render)

- [ ] Erros de gravação limpos (`limpar_erros.js`) e config feito sobre o vídeo `- limpo`
- [ ] Beat sheet mostrado ao usuário
- [ ] `npx tsc --noEmit -p .` limpo
- [ ] Folha de contato com 2 frames por cena (meio e fim) + 1 frame de transição
- [ ] Nada acima de y=110 ou atrás dos botões do Instagram (canto inferior direito)
- [ ] Legenda não colide com motion (split: senta na divisória; full: entre motion e bolha)
- [ ] Elementos que entram de fora não aparecem antes da hora
- [ ] Texto sem erro de digitação/acento; números conferem com a fala
- [ ] Emojis dentro da regra do `perfil.md`; nenhum dentro de cena
- [ ] Rosto ≥ 35% do tempo; nenhuma emoção coberta por motion
- [ ] Render sozinho (nada de still/npm em paralelo) e `ffprobe` confere 1080×1920 + áudio + duração
