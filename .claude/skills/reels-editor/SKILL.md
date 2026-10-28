---
name: reels-editor
description: Edição completa de Reels/Shorts/TikTok/VSL verticais a partir de um vídeo gravado — transcreve, corta automaticamente erros de gravação (frases repetidas, recomeços, palavras duplicadas, vícios), gera legendas dinâmicas (palavra ativa destacada), planeja um roteiro de cenas (beat sheet) e monta motions elaborados sincronizados com a fala, incluindo tela dividida (vídeo embaixo + motion em cima), tela cheia com rosto em bolha, overlays, efeitos sonoros, light leaks e emojis animados, renderizando MP4 1080×1920 com Remotion. Use sempre que o usuário pedir para "editar o vídeo", "editar o reels", "fazer a edição", "colocar legenda e animações", "motion no vídeo", "edição dinâmica", entregar um vídeo (.mp4/.mov) pedindo edição, legendas ou efeitos, "cortar os erros/repetições da gravação" — e também para "configurar reels-editor", "setup reels-editor" ou "personalizar a skill de edição".
---

# Reels Editor

O usuário entrega o **vídeo já cortado** (falando para a câmera, vertical). Esta skill faz o resto:
limpeza de erros de gravação → legendas → roteiro de cenas → motions → prévias → render final.

## 0. Antes de tudo — perfil
Leia **[perfil.md](perfil.md)**.
- Se estiver escrito `configurado: não` (ou se aparecer `{{` neste arquivo), **rode o setup primeiro**: siga **[references/setup.md](references/setup.md)** do início ao fim. Depois volte para o pedido original.
- Se estiver configurado, use as preferências de lá (cores, intensidade, emojis, idioma, nicho) em todas as decisões abaixo.

Tudo roda no projeto Remotion em `/home/user/albalub-sistema/video-tools/remotion` (comp `Reels`, 1080×1920 @ 30fps).
Se a skill `remotion-best-practices` estiver instalada, carregue-a antes de mexer em código Remotion.
Leia SEMPRE antes de planejar:
- **[references/direcao.md](references/direcao.md)** — playbook de direção: princípios, qual motion para cada tipo de fala, split × full × rosto, estrutura de retenção, VSL, QA.
- **[references/componentes.md](references/componentes.md)** — catálogo de componentes e props do config.
- **[references/exemplo-config.json](references/exemplo-config.json)** — exemplo completo de config.

Biblioteca de motions (14): statement, bigNumber, chart, profile, compare, belief, timeline, options, shareNetwork, commentFunnel, reach, offerStack, aiPipeline, editorAuto — todos funcionam em **split** (vídeo embaixo) ou **full** (motion em tela cheia, rosto em bolha). Vitrine: composição `Catalogo` (se o usuário quiser escolher estilos, renderize — ver componentes.md).

---

## Fluxo

### 1. Receber o vídeo
- Pergunte o caminho só se não foi dado. Pasta padrão de brutos: ver `perfil.md` (senão `/home/user/albalub-sistema/video-tools/entrada`).
- Nome do projeto: slug curto sem espaços (ex.: `3-erros-bio`, `aula-01`).
- Confira o codec: `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate -of csv=p=0 "<video>"`.
  Se for **hevc** (H.265 — comum em iPhone, GoPro, DJI) o vídeo precisa virar H.264 (o Chrome do Remotion pode não decodificar). O `limpar_erros.js aplicar` (passo 2b) já gera H.264; só converta à parte se não houver nenhum corte:
  `ffmpeg -i in.mp4 -c:v libx264 -c:a aac -b:a 192k -map_metadata -1 out.mp4`
  (com `libx264` use `-crf 18 -preset fast`; com `h264_nvenc` use `-cq 19`; com `h264_qsv` use `-global_quality 18`; com `h264_videotoolbox` use `-q:v 65`.)
- Se não for 9:16, avise antes de seguir.
- **Olhe o vídeo antes de planejar** — ele pode já ter inserções (picture-in-picture, tela gravada, trecho de outro vídeo com legenda queimada):
  `ffmpeg -v error -y -i "<video>" -vf "fps=1,scale=108:-1,tile=17x6" -frames:v 1 scan.png` (1 quadro/s) e, para os limites exatos, `ffmpeg -i "<video>" -vf "select='gt(scene,0.15)',showinfo" -an -f null -`.
  Nesses trechos: nada de cena por cima, overlays fora da área da inserção, e remova as palavras de `captions.json` onde já houver legenda queimada.

### 2. Transcrever
```
python3 /home/user/albalub-sistema/video-tools/transcrever.py "<video>" --idioma pt --device cpu
```
Gera `<video>.json` (palavra a palavra), `.srt` e `.txt` ao lado do vídeo. Na CPU leva ~1–2× a duração (Whisper medium) — rode em foreground com timeout alto (ou em background e espere).

### 2b. Limpar erros de gravação
Frase repetida, recomeço ("eu vendi trinta… eu vendi 30 mil"), palavra dupla ("dois, dois") e vícios ("hum") viram corte — o vídeo fica só com o take certo. Siga a preferência **Limpeza de erros** do `perfil.md` (*automática* = mostra a lista e aplica; *revisar antes* = mostra a lista e espera o OK; *desligada* = pula este passo; *+ pausas* = acrescente `--pausas 1.0`).
```
node /home/user/albalub-sistema/video-tools/limpar_erros.js detectar "<video>.json" --idioma pt
```
Imprime os candidatos (`✂` = certeza, `?` = revisar, `⚑` = marcador falado como "corta"/"de novo") e grava `<video>.cortes.json`.
- **Revise você mesmo** cada `?` lendo o contexto: lista legítima ("um PDF, um vídeo") e paralelismo/ênfase intencional ("tem que ser simples, tem que ser direto", "muito, muito") ficam; troca de palavra ("um pequeno, um simples") sai. Mude `"aplicar"` no JSON.
- Leia também o `.txt` inteiro procurando erros que o detector não pega: recomeço com outras palavras ("a gente vendeu… eu vendi"), informação errada corrigida logo depois, trecho em volta de um `⚑`. Adicione cortes manuais `{ "inicio": s, "fim": s, "aplicar": true }` (tempos do JSON; do início da 1ª palavra errada até ~0.1s antes da 1ª palavra certa).
- Mostre ao usuário uma lista curta do que vai sair (texto removido + contexto) e aplique:
```
node /home/user/albalub-sistema/video-tools/limpar_erros.js aplicar "<video>" "<video>.json" --encoder libx264
```
Gera `<video> - limpo.mp4` (H.264) e `<video> - limpo.json` (transcrição com os tempos reajustados; não precisa transcrever de novo). **A partir daqui use os arquivos `- limpo`.** Sem nenhum corte marcado, siga com o original.

### 3. Preparar o projeto
```
node /home/user/albalub-sistema/video-tools/preparar_remotion.js "<video limpo>" "<video limpo>.json" <nome>
node /home/user/albalub-sistema/video-tools/frases.js <nome> --palavras
```
O primeiro copia vídeo + legendas limpas para `remotion/public/<nome>/` e cria `config.json` vazio com a duração.
O segundo imprime as frases com o tempo exato de cada palavra — é daqui que saem TODOS os tempos do config.
Corrija erros óbvios de transcrição direto em `captions.json` (nomes próprios, marcas, números).

### 4. Beat sheet (mostrar ao usuário ANTES de construir)
Leia o roteiro inteiro e identifique a estrutura (gancho, promessa, etapas/pilares, exemplo, CTA). Monte uma tabela curta:

| Tempo | O que é dito | Tratamento |
|---|---|---|
| 0–4s | "vendi R$ 30 mil sem anúncio" | rosto + overlay counter R$ 30.000 |
| 10.7–15.9 | "cresceu 180 mil seguidores" | **split** `profile` — perfil com seguidores subindo |
| 40–45 | "faturou 3x mais" | **full** `bigNumber` 3x — rosto em bolha |
| ... | ... | ... |

Regras do roteiro (ajuste a densidade pela **intensidade** do `perfil.md`):

| Intensidade | Cenas (split+full) em ~2 min | Full por vídeo | Rosto cheio mínimo |
|---|---|---|---|
| minimalista | 2–3 (≈1 a cada 40s) | 0–1 | 55% |
| equilibrado | 4–6 (≈1 a cada 20–25s) | 2–3 | 35% |
| insano | 7–9 (≈1 a cada 13–16s) | 3–4 | 25% |

- Cenas ficam nos momentos em que a fala descreve um **processo, mecanismo, comparação, lista ou número** — algo que dá para *mostrar*. Cada uma com 5–15s (full 3–8s). Não usar em frases de emoção/opinião, nem no gancho dos 3 primeiros segundos (o rosto segura a retenção ali), nem no CTA. Escolha o motion pela tabela de `direcao.md` §2.
- Varie: não use o mesmo motion duas vezes seguidas, alterne split e full.
- Nos trechos de rosto cheio, use overlays (counter, title, stage, reactions...) — eles ficam no topo, sem cobrir o rosto.
- **Emojis** conforme `perfil.md`: *nunca* = zero; *raro* = no máx. ~1 a cada 30s, só em punchlines; *frequente* = ~1 a cada 12–15s. Nunca dois seguidos, nunca dentro de cena.
- Light leak de 1.1s em cada virada de bloco (início, troca de etapa, CTA).
- Se o vídeo tem etapas numeradas, use `roadmap` + `stage` (trilho de progresso).
- O motion tem que **ilustrar o que está sendo dito naquele segundo**, sincronizado palavra a palavra — não é decoração.
- Exemplos de texto/CTA: use o nicho e o público do `perfil.md` como referência de vocabulário.

Mostre o beat sheet e siga direto para a construção, a menos que o usuário queira revisar (se ele pedir para ver antes, espere).

### 5. Montar o config
Escreva `remotion/public/<nome>/config.json` com `overlays` e `scenes` (ver catálogo). Todos os tempos em segundos absolutos do vídeo.
- Prefira os motions existentes, parametrizados com o texto do vídeo.
- Se um momento pede algo que nenhum motion cobre, **crie um motion novo** em `src/motions/<Nome>.tsx` seguindo o padrão do kit (`useCena`, `Area`, `vidro`, `Selo`, `Som`) e registre em `src/Split.tsx` (tipo `Scene` + mapa `MOTIONS`). Depois documente em `references/componentes.md`.
- Type-check (na pasta `/home/user/albalub-sistema/video-tools/remotion`): `npx tsc --noEmit -p .`

### 6. Prévias (obrigatório)
Antes, passe o checklist de QA de `direcao.md` §8.
Gere stills dos momentos-chave de cada cena e monte uma folha de contato para olhar:
```
npx remotion still Reels prev/f<N>.png --frame=<N> --scale=0.4 --props=props-<nome>.json --log=error
ffmpeg -v error -y -i a.png -i b.png ... -filter_complex "[0][1]...hstack=6" folha.png
```
(`props-<nome>.json` na pasta remotion contém `{"projeto":"<nome>"}`; frame = segundos × 30.)
Use uma pasta temporária para os PNGs. Confira: nada cortado, nada em cima do rosto, legenda legível e sem colidir com o motion, elementos fora da tela não aparecendo antes de entrar.

### 7. Render final
Na pasta `/home/user/albalub-sistema/video-tools/remotion`:
```
npx remotion render Reels "../saida/<nome> - REELS.mp4" --props=props-<nome>.json --concurrency=2 --crf=18 --log=error
```
- Rode em background e espere a notificação. Leva alguns minutos por minuto de vídeo (depende da máquina).
- ⚠️ **Nunca rode `remotion still`, `npm install` ou outro render ao mesmo tempo** — quebra a mixagem de áudio (`remotion-audio-mixing\...wav: No such file`).
- Verifique: `ffprobe -v error -show_entries stream=codec_type,width,height -show_entries format=duration -of compact "<saida>"` (1080×1920, duração certa, com áudio).

### 8. Entregar
Caminho do MP4 + resumo curto do que entrou (cenas, overlays, sons) + créditos quando houver emoji Noto ("Noto Emoji © Google, CC BY 4.0" na legenda do post). Ofereça ajustes pontuais — mudar uma cena é editar o config e re-renderizar.

---

## Identidade visual
- Tudo que é marca fica no bloco **`MARCA`** de `src/theme.ts` (cor de destaque, tinta, legenda, barra de progresso, SFX) e a fonte no `import` do topo do mesmo arquivo. O resumo das escolhas está em `perfil.md`.
- Fundo preto; o que importa brilha na cor de destaque.
- Legendas: 2–3 palavras por tela, palavra ativa na cor de destaque; sobem para a divisória na tela dividida.
- Motions: cartões de vidro escuro, selos na cor de destaque com texto na cor `ink`, ícones de traço (Lucide) — sem emojis dentro dos motions.
- Zona segura do Instagram/TikTok: nada importante acima de y=110 nem nos 300px de baixo à direita (botões).

## Edição por feedback
| Usuário diz | Faça |
|---|---|
| "legenda grande/pequena" | `MARCA.legenda.tamanho` em `src/theme.ts` |
| "legenda mais alta/baixa" | `MARCA.legenda.posicaoY` |
| "legenda em maiúsculas/normal" | `MARCA.legenda.caixa` |
| "outra cor" | `MARCA.accent/accentSoft/accentDeep/ink` em `src/theme.ts` (atualize `perfil.md`) |
| "outra fonte" | troque o pacote em `import { loadFont } from "@remotion/google-fonts/<Fonte>"` |
| "mais/menos emoji" | adicionar/remover overlays `emoji` (e atualizar `perfil.md` se for preferência fixa) |
| "essa cena muito rápida" | aumentar `end` da cena e espaçar os tempos internos |
| "sem som / som alto" | `MARCA.sfx` ou volumes nos `<Som>`/`<Sfx>` (0.25–0.55) |
| "rosto pequeno na tela dividida" | `ZOOM_SPLIT` / `FOCO_SPLIT` em `src/ZoomVideo.tsx` |
| "rosto pequeno/cortado na bolha" | `ZOOM_FULL` / `FOCO_FULL` (ZoomVideo) e `FULL.bolha` (Split.tsx) |
| "quero essa cena em tela cheia" | `"layout": "full"` na cena |
| "mais/menos animação" | adicionar/remover cenas (ou mudar a intensidade no `perfil.md`) |
| "texto digitando rápido/devagar" | `porLetra` no `statement` |
| "ficou um erro/repetição" / "cortou demais" | editar `<video>.cortes.json` (aplicar/inicio/fim), rodar `limpar_erros.js aplicar` de novo a partir do ORIGINAL, refazer `preparar_remotion.js` e reajustar os tempos do config (tudo depois do corte desloca) |
| "corta as pausas / mais ritmo" | `detectar --pausas 0.8` |
| "quero ver as opções de motion" | renderizar a composição `Catalogo` |
| "gostei/não gostei de X" | registrar em `perfil.md` → seção *Aprendizados* para os próximos vídeos |
| "refazer a configuração" | mudar `configurado: não` no `perfil.md` e rodar `references/setup.md` |

## Assets
- Sons (`public/sfx/*.wav`, Kenney CC0): whoosh, whip, pop, pluck, ding, tick, unlock, glass, coins, rise, swoosh-up.
- Emojis Lottie (`public/lottie/*.json`, Noto CC BY 4.0) — lista no catálogo. Novos: `https://fonts.gstatic.com/s/e/notoemoji/latest/<codepoint>/lottie.json`.
- LottieFiles bloqueia download automático: se o usuário quiser uma animação de lá, ele baixa o .json para `public/lottie/`.
