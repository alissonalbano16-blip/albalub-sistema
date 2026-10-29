# Catálogo de componentes — config.json

Arquivo: `/home/user/albalub-sistema/video-tools/remotion/public/<nome>/config.json`

```json
{
  "video": "<nome>/video.mp4",
  "captions": "<nome>/captions.json",
  "durationSec": 138.2,
  "overlays": [ ... ],
  "scenes":   [ ... ]
}
```

- **Tempos sempre em segundos absolutos** do vídeo (os mesmos de `frases.js --palavras`).
- `overlays` = elementos por cima do vídeo em tela cheia (ficam no topo, y 110–600). Somem sozinhos durante a tela dividida (menos `leak`).
- `scenes` = tela dividida. Cenas com intervalo < 0.6s entre si viram um bloco só (o vídeo não sobe e desce no meio).
- Os sons de cada componente já estão embutidos; não precisa adicionar SFX à parte.

Código: overlays em `src/Overlays.tsx`, motions em `src/motions/*.tsx`, registro das cenas em `src/Split.tsx`.

---

## Scenes (tela dividida)

Cada cena: `{ "start", "end", "motion": "<tipo>", ...props }`. O vídeo desce para y 900–1920 (zoom 1.2, foco no rosto), o motion ocupa a área y 140–860, a legenda senta na divisória na cor de destaque. Transição de 0.45s com whoosh na entrada e swoosh na saída.

Planeje 0.3–0.5s **antes** da primeira palavra que o motion ilustra (o painel precisa abrir).

### Layout `full`
Qualquer cena aceita `"layout": "full"`: o vídeo encolhe até uma **bolha redonda** com anel na cor de destaque (340px, centro y 1520), o painel cobre a tela inteira, o motion é ampliado 1.12× e descido 110px (área ≈ y 250–1060), a legenda fica em y 1190. Use quando o visual É a mensagem (número, oferta, frase, gráfico). Ajustes em `FULL` (`src/Split.tsx`) e `ZOOM_FULL`/`FOCO_FULL` (`src/ZoomVideo.tsx`).
```json
{ "start": 2, "end": 8, "layout": "full", "motion": "bigNumber", "prefix": "R$", "value": 30000, "countAt": 2.5, "countEnd": 3.8, "label": "SEM ANÚNCIO" }
```
Cenas só se fundem num bloco se tiverem o mesmo layout.

### Vitrine
Composição `Catalogo` (`src/Catalogo.tsx` + demos em `src/demos.ts`) mostra todos os motions em sequência. Para gerar o vídeo: `npx remotion render Catalogo "../saida/CATALOGO de motions.mp4" --concurrency=2 --crf=18 --log=error` (~90s de vídeo). Ao criar motion novo, adicione um demo em `demos.ts` e teste com `npx remotion still Catalogo ...`.

### `statement` — frase de impacto digitada
Para: gancho, tese, "a verdade é que...", garantia. Ótimo em **full**.
```json
{ "start": 0.5, "end": 5.5, "motion": "statement", "icon": "bulb", "iconAt": 0.8,
  "lines": [ {"text": "ninguém te conta", "at": 1.1}, {"text": "essa estratégia", "at": 2.1, "accent": true} ] }
```
Ladrilho de vidro com ícone + shockwave → linhas digitadas (0.045s/letra, `porLetra` ajusta) com a última letra piscando na cor de destaque e cursor. Até 3 linhas, ≤ 20 caracteres cada (fonte se ajusta). Próxima linha em `at` ≥ anterior + 0.045×letras.

### `bigNumber` — número gigante
Para: resultado, faturamento, %, multiplicador.
```json
{ "start": 6.7, "end": 11.7, "motion": "bigNumber", "icon": "dollar",
  "prefix": "R$", "value": 30000, "suffix": "", "compacto": false, "casas": 0,
  "countAt": 7.2, "countEnd": 8.7, "label": "SEM ANÚNCIO", "labelAt": 8.9 }
```
Conta com tremor; ao travar fica na cor de destaque com bloom, soco de escala e shockwave (coins se prefixo R$, senão ding). `compacto`: 180000 → "180 mil".

### `chart` — gráfico se desenhando
Para: crescimento ao longo do tempo (ou queda com `"down": true`, vermelho).
```json
{ "start": 19.1, "end": 24.1, "motion": "chart", "title": "faturamento",
  "points": [3000, 4200, 3900, 8000, 14500, 30000], "xLabels": ["jan","fev","mar","abr","mai","jun"],
  "prefix": "R$ ", "drawAt": 19.6, "drawEnd": 21.7, "label": "10X EM 6 MESES" }
```
Linha com glow + área iluminada, ponto de luz na ponta com o valor seguindo, shockwave no fim, selo.

### `compare` — antes × depois
Para: errado × certo, maioria × quem vende, antes × depois, eles × você.
```json
{ "start": 25.3, "end": 31.8, "motion": "compare",
  "left":  { "title": "ANTES",  "at": 25.6, "items": [ {"text": "posta todo dia", "at": 26.0}, {"text": "sem vender", "at": 26.5} ] },
  "right": { "title": "DEPOIS", "at": 27.7, "items": [ {"text": "conteúdo certo", "at": 28.1}, {"text": "vende no direct", "at": 28.6} ] },
  "verdict": "MUDE A ESTRATÉGIA", "verdictAt": 29.9 }
```
Esquerda (X vermelhos) entra e apaga quando a direita (checks, borda na cor de destaque) chega; "vs" girando no meio; carimbo opcional. Até 4 itens por lado, ≤ 16 caracteres.

No layout `full` a área é ampliada 1.12× a partir do centro: as colunas (440px, x 70 e 570) já cabem — não alargue. Quando a coluna direita entra, a esquerda apaga e ganha risco vermelho. Dê ≥ 1.5s entre `right.at` e o `verdictAt`, senão a coluna boa "pisca".

### `timeline` — jornada em passos
Para: método em etapas, "primeiro/depois/por fim", processo.
```json
{ "start": 41.2, "end": 48.2, "motion": "timeline",
  "steps": [ {"label": "Atrair", "sub": "conteúdo compartilhável", "icon": "users", "at": 41.6},
             {"label": "Engajar", "sub": "palavra-chave", "icon": "comment", "at": 43.1},
             {"label": "Converter", "sub": "oferta no direct", "icon": "send", "at": 44.6} ],
  "doneAt": 47.2, "doneLabel": "FUNIL COMPLETO" }
```
Passo atual GRANDE no centro (ladrilho com ícone ou número + título + sub), trocando com push lateral; trilho embaixo com ponto de luz viajando entre nós. 2–5 passos, ≥ 1.2s cada.

### `offerStack` — empilhamento de oferta (VSL)
Para: "tudo isso valeria X... mas hoje por Y". Use em **full**.
```json
{ "start": 84.2, "end": 91.2, "layout": "full", "motion": "offerStack",
  "items": [ {"label": "Curso completo", "value": 997, "at": 84.6, "icon": "play"},
             {"label": "Mentoria em grupo", "value": 1497, "at": 85.2, "icon": "users"} ],
  "totalAt": 87.2, "totalLabel": "valor total", "priceAt": 88.5, "price": 497,
  "priceLabel": "hoje por apenas", "prefix": "R$ ", "sufixoPreco": "" }
```
Itens com valor → soma → total riscado em vermelho → preço real explode com bloom/shockwave/coins. Até 5 itens.

### `profile` — perfil do Instagram crescendo
Para: "cresceu X seguidores", "meu perfil saiu de X para Y", prova social.
```json
{ "start": 10.7, "end": 15.9, "motion": "profile",
  "name": "Sua cliente", "handle": "@cliente", "to": 180000,
  "countAt": 11.5, "countEnd": 12.7, "label": "+180 MIL SEGUIDORES" }
```
Contador de seguidores sobe de 0 a `to` entre `countAt`–`countEnd` com avatares voando para dentro; selo `label` no fim.

### `belief` — quebra de crença / antes × depois de mentalidade
Para: "quebre a crença", "a visão dele está errada", "não é X, é Y".
```json
{ "start": 30.1, "end": 37.15, "motion": "belief",
  "word": "CRENÇA", "crackAt": 30.5,
  "newText": "SUA VISÃO", "newAt": 32.6,
  "subText": "é diferente", "subAt": 33.32,
  "oldText": "a visão dela", "oldAt": 34.76, "wrongAt": 36.64 }
```
Cartão `word` racha e cai (vidro quebrando) → cartão na cor de destaque `newText` com olho → carimbo `subText` → cartão `oldText` entra e é riscado com X vermelho em `wrongAt`.

### `shareNetwork` — conteúdo compartilhado se espalhando
Para: "conteúdo compartilhável", "a pessoa manda para um amigo", viralização, alcance orgânico.
```json
{ "start": 52.1, "end": 65.6, "motion": "shareNetwork",
  "checks": [ {"label": "relevante", "at": 52.46}, {"label": "transforma", "at": 53.82}, {"label": "ganho rápido", "at": 56.0} ],
  "shareAt": 60.02, "friendAt": 61.14, "friendLabel": "amiga",
  "spreadAt": 62.3, "label": "PÚBLICO QUALIFICADO", "labelAt": 63.62 }
```
Post + checklist (até 4 itens, rótulos curtos ≤ 14 caracteres) → botão enviar pulsa, avião voa até o avatar → rede 1→3→9 se desenhando + selo.

### `commentFunnel` — palavra-chave → direct → produto
Para: "comente X que eu te mando", automação de direct, funil de comentário, isca.
```json
{ "start": 75.5, "end": 83.45, "motion": "commentFunnel",
  "keyword": "QUERO", "typeAt": 76.1, "postAt": 77.4,
  "dmAt": 79.3, "link": "acesse aqui",
  "productAt": 79.94, "product": "Seu produto", "productSub": "a solução da dor",
  "solveAt": 81.95, "solveText": "RESOLVE A DOR" }
```
Digitação letra a letra (0.09s/letra, tick em cada) → comentário publicado + curtida → balão de direct com link → cartão do produto + carimbo.
`postAt` precisa ser ≥ `typeAt + 0.09 × letras + 0.3`.

### `reach` — engajamento → ranking → alcance
Para: "cada comentário é engajamento", "o algoritmo entrega mais", "chega para mais pessoas".
```json
{ "start": 83.45, "end": 91.2, "motion": "reach",
  "commentsAt": 83.7, "comments": 1248, "words": ["quero", "eu quero!", "QUERO", "manda"],
  "engageAt": 84.7, "rankAt": 87.3, "rankLabel": "INSTAGRAM RANQUEIA",
  "peopleAt": 89.85, "peopleLabel": "MAIS PESSOAS" }
```
3 fases que se trocam sozinhas: contador de comentários + bolhas subindo + barra de engajamento → lista de ranking com "seu post" subindo de #4 para #1 → multidão de avatares em anéis + selo.
Dê ≥ 2s para cada fase.

### `options` — lista de opções/exemplos
Para: "você pode mandar A, B ou C", listas de dicas, ferramentas, passos curtos (até 4 itens).
```json
{ "start": 96.9, "end": 108.0, "motion": "options",
  "header": "você manda no direct:", "headerIcon": "send",
  "items": [
    {"icon": "utensils", "title": "Receitas saudáveis", "sub": "PDF / e-book", "at": 98.18},
    {"icon": "book", "title": "Seu método", "sub": "para emagrecimento", "at": 100.22},
    {"icon": "play", "title": "Vídeo no YouTube", "sub": "explica a dor", "at": 103.36}
  ],
  "footer": "RESOLVE A DOR", "footerAt": 105.5 }
```
Cada item entra da direita no tempo da palavra; o item atual fica com borda na cor de destaque. `footer` opcional (carimbo).

### `aiPipeline` — arquivo → IA → pergunta
Para: "você pega o arquivo e joga na IA", "manda pra ferramenta e ela te pergunta…", qualquer "entrega para a máquina".
```json
{ "start": 37.5, "end": 44.55, "motion": "aiPipeline",
  "fileAt": 37.9, "fileName": "meu-video.mp4", "fileSub": "1080×1920 · 85s",
  "sendAt": 39.9, "askAt": 42.35, "askText": "Antes, algumas perguntas…" }
```
Cartão do arquivo aparece no centro → em `sendAt` desliza e voa em arco para dentro de um núcleo amarelo de IA (absorção com shockwave ~1s depois) → em `askAt` o núcleo sobe e um balão digita `askText`. `aiLabel` opcional (padrão "IA"). Dê ≥ 2s entre `sendAt` e `askAt`.

### `editorAuto` — IA editando o vídeo sozinha
Para: "ela vai editar", "começa a edição completa", automação trabalhando, qualquer processo que "se faz sozinho".
```json
{ "start": 50.6, "end": 57.65, "motion": "editorAuto",
  "openAt": 50.9, "cutAt": 52.6, "captionsAt": 54.05, "motionsAt": 55.0, "sfxAt": 55.7,
  "doneAt": 56.55, "doneLabel": "100% AUTOMÁTICA" }
```
Janela de editor com prévia 9:16 + 4 trilhas (vídeo, legenda, motion, efeitos). O clipe é cortado (whips), blocos de legenda/motion/som vão preenchendo cada trilha, a agulha corre e o % sobe de `cutAt` até `doneAt`, quando bate o carimbo. `title` opcional (padrão "Editor IA"). Deixe ≥ 0.7s entre as fases.

### `contato` — WhatsApp e PIX
Para: "fala comigo", "me chama no WhatsApp", "doe pelo PIX".
```json
{ "start": 25.3, "end": 28.6, "motion": "contato",
  "whatsapp": "(85) 98179-6430", "whatsAt": 25.6,
  "pixChave": "(85) 98179-6430", "pixNome": "Nome do titular", "pixAt": 26.5,
  "selo": "FALA COMIGO", "seloAt": 27.3 }
```
Cartão do WhatsApp entra da direita com shockwave → cartão do PIX (chave + nome do titular) entra e fica ativo → carimbo. PIX e selo são opcionais. Confira o número com o usuário (celular = DDD + 9 dígitos).

Versão compacta em rosto cheio: overlay `contato` (`whatsapp`, `pix?`, `nome?`) no topo.

### Criando um motion novo
Quando a fala pede algo que nenhum motion acima mostra bem (ex.: comparação de preço, linha do tempo, antes/depois de resultado, calendário, checklist longo):
1. `src/motions/<Nome>.tsx` exportando `<Nome>Props` (com `start`) e o componente.
2. Use o kit (`./kit`): `useCena(start)` → `{ t, pop(at), ramp(a,b), saida, Som }`; `<Area>` (1080×720, já posicionada); `vidro` (estilo de cartão); `Selo`; `Avatar`; `texto(size, weight, color)`.
   Peças de "luz": `Bloom` (brilho atrás), `Shockwave` (anéis quando algo trava), `Digitando` (texto digitado com flash na cor de destaque na última letra), `Ladrilho` (ícone em vidro), `Carimbo` (selo que bate), `fmtNum` (números BR), `VERMELHO`.
3. Sincronize tudo por tempos absolutos vindos da transcrição; sons com `<Som nome at volume>`.
4. Registre em `src/Split.tsx` (união `Scene` + mapa `MOTIONS`), adicione um demo em `src/demos.ts` e documente aqui.
5. Mantenha 1 ideia por fase, elementos grandes (textos ≥ 28px), e não ultrapasse y 720 dentro da Área.

---

## Overlays (tela cheia)

Todos: `{ "type", "start", "end", ... }`.

| type | props | uso |
|---|---|---|
| `counter` | `prefix`, `value`, `suffix`, `label` | número grande contando (R$, %, seguidores) + pílula. Dá zoom-soco. |
| `title` | `text`, `icon?: "lock"` | título de impacto com flash ("ESTRATÉGIA SECRETA"); `lock` = cadeado abrindo. |
| `headline` | `lines: [{text, at, box?}]`, `side?: "center" ou "right"`, `centerAt?`, `stamp?`, `stampAt?`, `pulseAt?` | headline de abertura em 2–3 linhas que sobem com desfoque; `box: true` = faixa amarela com texto preto (wipe); `*palavra*` = destaque amarelo; `side: "right"` começa menor ao lado (ex.: quando há um PiP no canto) e desliza ao centro em `centerAt`; `stamp` = selo ("R$ 0") ao lado da última linha; `pulseAt` pulsa a faixa. Tempos **relativos** ao start. Ex.: "EDITEI COM *IA*" / "EM 15 MINUTOS" (box) / "SEM GASTAR". |
| `roadmap` | `text` | "3 ETAPAS" + trilho de 3 nós aparecendo. |
| `stage` | `num`, `total`, `title` | entra grande, avança o trilho e encolhe para o topo; dura a etapa inteira. Use `\n` para quebrar títulos longos (> 16 caracteres). |
| `tag` | `text` | etiqueta pequena sob o trilho ("EXEMPLO PRÁTICO"). |
| `crack` | `text` | cartão branco que racha (versão compacta do `belief`). |
| `reactions` | `upAt`, `downAt` (relativos ao start!) | 👍 CONCORDA / 👎 DISCORDA. |
| `hearts` | — | corações subindo pelas laterais (~1.3s). |
| `share` | `friendAt` (relativo) | avião de papel até 3 avatares (versão compacta do `shareNetwork`). |
| `flow` | `steps: [{icon, label, at}]` (`at` relativo) | chips com setas A → B → C. |
| `growth` | `label` | cartão com gráfico subindo. |
| `people` | — | grade de avatares. |
| `cta` | `line1`, `line2` | balão de comentário + "COMENTE" + caixa na cor de destaque com a palavra-chave. Último ~8s. |
| `emoji` | `name`, `pos?` (`left`/`right`/`left-low`/`right-low`), `size?` | emoji animado no canto. **Use pouco.** |
| `leak` | `seed`, `hue?` | light leak de 1.1s nas viradas. |
| `contato` | `whatsapp`, `pix?`, `nome?` | cartão compacto no topo com WhatsApp e chave PIX (rosto continua visível). |

Atenção: nos overlays antigos (`reactions`, `share`, `flow`) os tempos internos são **relativos** ao `start` do overlay; nos `scenes` tudo é absoluto.

Ícones (`IconName`): zap, send, infinity, heart, thumbUp, comment, link, package, user, check, x, play, eye, bookmark, trendingUp, trendingDown, book, utensils, dollar, clock, calendar, target, rocket, star, bulb, alert, users, barChart, phone, flame, crown, shield, search, cart, gift, mic, arrowRight, trendingDown, scissors, palette, type, sparkles, volume. Para adicionar, copie os paths do Lucide para `src/Icons.tsx`.

Emojis Lottie disponíveis: bullseye chart check clap crystal explode eyes fire gem gift heart-fire hundred infinity light-bulb mindblown money-face money-wings muscle party pleading point-down rocket salute shush sparkles speech star-struck thinking wave.

## Sons (`public/sfx`)
whoosh (entrada), whip (corte/erro), pop (item aparecendo), pluck (leve), ding (confirmação), tick (digitação), unlock (cadeado), glass (quebra), coins (dinheiro), rise (subida), swoosh-up (saída). Volumes entre 0.25 e 0.55 — a voz manda.
