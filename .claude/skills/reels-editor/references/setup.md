# Setup do reels-editor (primeira configuração)

Objetivo: deixar a skill pronta e com a cara da pessoa. Você (Claude) conduz a conversa: **detecta o ambiente sozinho, pergunta só o que é gosto pessoal e aplica as respostas nos arquivos.**

Tom: amigável e direto, em português. Explique em uma frase por que cada pergunta importa. Se existir a ferramenta **AskUserQuestion**, use-a (até 4 perguntas por rodada, com opções); se não, pergunte em texto com opções numeradas. Sempre aceite resposta livre ("outra").

Caminhos abaixo: `<SKILL>` = pasta desta skill (onde está o `SKILL.md`); `<VT>` = pasta `video-tools` do kit.

---

## Etapa 1 — Ambiente (detectar, não perguntar)

Rode e anote os resultados (adapte ao sistema: Windows usa PowerShell/Git Bash; macOS/Linux usam bash):

| Item | Como checar | Se faltar |
|---|---|---|
| Sistema | `node -e "console.log(process.platform, require('os').cpus().length+' núcleos')"` | — |
| Node 18+ | `node -v` | Windows: `winget install OpenJS.NodeJS.LTS` · macOS: `brew install node` |
| FFmpeg | `ffmpeg -version` | Windows: `winget install Gyan.FFmpeg` · macOS: `brew install ffmpeg` · Linux: `sudo apt install ffmpeg` |
| Python 3.9+ | `python --version` (Windows também `py --version`; macOS `python3`) | Windows: `winget install Python.Python.3.12` · macOS: `brew install python` |
| faster-whisper | `<python> -c "import faster_whisper; print('ok')"` | `<python> -m pip install faster-whisper` |
| GPU NVIDIA | `nvidia-smi` | opcional |

- **Peça permissão antes de instalar qualquer coisa** (diga o que será instalado e o comando). Após instalar via winget, pode ser preciso abrir um terminal novo para o PATH atualizar — se o comando ainda não for achado, procure o executável e use o caminho completo.
- Guarde o comando Python que funcionou (ex.: `python`, `py`, `python3` ou o caminho completo) → **`{{PYTHON}}`**.
- **Device da transcrição**: se tem NVIDIA, teste
  `<python> -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cuda', compute_type='float16'); print('cuda ok')"`.
  Funcionou → `cuda`; falhou (falta cuDNN/cuBLAS) → `cpu` (avise que dá para ativar depois). Sem NVIDIA → `cpu`. → **`{{DEVICE}}`**
- **Encoder H.264** (para converter vídeos HEVC): liste com `ffmpeg -hide_banner -encoders` e teste na ordem `h264_nvenc` (NVIDIA), `h264_qsv` (Intel), `h264_amf` (AMD), `h264_videotoolbox` (Mac), com
  `ffmpeg -v error -f lavfi -i testsrc=duration=1:size=640x360:rate=30 -c:v <enc> -f null -`.
  O primeiro que rodar sem erro → **`{{ENCODER_H264}}`**; nenhum → `libx264`.
- **Concorrência do render** = `max(2, min(8, floor(núcleos/2)))` → **`{{CONCORRENCIA}}`**.

### Pasta video-tools
- Confirme onde está a pasta `video-tools` do kit (procure por `video-tools/remotion/package.json` perto do kit baixado, ou pergunte). Sugira deixá-la num lugar fixo (ex.: `~/video-tools` ou `C:/video-tools`) — se a pessoa quiser mover, mova antes de continuar.
- Caminho absoluto com barras `/` → **`{{VIDEO_TOOLS}}`**.
- Instale as dependências: `npm install` dentro de `<VT>/remotion` (leva alguns minutos; o Remotion baixa um Chrome próprio no primeiro render — é normal).

Mostre um resumo curto do ambiente ("tudo certo ✅ / falta X") antes de seguir.

---

## Etapa 2 — Perguntas (gosto pessoal)

Faça em 3 rodadas. Sugira o padrão em cada uma (marcado **padrão**).

### Rodada 1 — Marca
1. **Cor de destaque** (palavra ativa da legenda, selos, brilhos). Opções:
   Amarelo `#FFD60A` (**padrão**) · Verde-limão `#B6FF3B` · Ciano `#22D3EE` · Laranja `#FF7A1A` · Rosa `#FF3D9A` · Vermelho `#FF3B3B` · Roxo `#8B5CF6` · Azul `#3B82F6` · "minha cor (hex)".
   Com AskUserQuestion: mostre 3 cores + permita "outra" (a pessoa digita nome ou hex). Se der o nome de uma cor, converta para um hex vibrante (o fundo é preto — cores escuras demais somem; se o hex tiver luminância < 0.25, sugira uma versão mais clara).
2. **Fonte**: Poppins (**padrão**, arredondada e moderna) · Montserrat (geométrica, forte) · Inter (limpa, neutra) · Outfit (moderna, tech) · "outra do Google Fonts".
   Fonte precisa ter pesos 500 a 900. Para "outra", valide (em `<VT>/remotion`):
   `node -e "const f=require('@remotion/google-fonts/<NomeSemEspaços>'); console.log(Object.keys(f.getInfo().fonts.normal))"`
   (ex.: `PlusJakartaSans`, `DMSans`, `Rubik`). Se faltar algum peso entre 500–900, avise e ofereça as que funcionam; fontes de peso único (Anton, Bebas Neue) ficam feias com negrito sintético.
3. **Nicho e público** (texto livre, 1 linha cada): ex. "nutrição — mulheres 30+ querendo emagrecer". Serve para os exemplos dos motions e o vocabulário dos selos/CTAs.

### Rodada 2 — Legendas
4. **Caixa**: minúsculas (**padrão**, estilo moderno) · Normal (como foi falado) · MAIÚSCULAS (impacto).
5. **Tamanho**: Pequena (58) · Média (66, **padrão**) · Grande (80).
6. **Palavras por tela**: 1 (ritmo frenético) · 2 · 3 (**padrão**) · 4 (mais leitura).
7. **Posição** (com rosto em tela cheia): Mais alta (1150) · Meio-baixo (1300, **padrão**) · Baixa (1450 — cuidado com a descrição do post).

### Rodada 3 — Estilo e conteúdo
8. **Intensidade da edição**: Minimalista (poucas cenas, mais rosto) · Equilibrado (**padrão**) · Insano (muitas cenas, ritmo alto).
9. **Emojis animados**: Nunca · Raros (**padrão**, só em punchlines) · Frequentes.
10. **Efeitos sonoros e barra de progresso** (multiSelect): SFX ligados (**padrão** sim) · Barra de progresso no topo (**padrão** sim).
11. **Idioma falado nos vídeos**: Português (`pt`, **padrão**) · Inglês (`en`) · Espanhol (`es`) · Detectar sozinho (`auto`). → **`{{IDIOMA}}`**
12. **Formato principal**: Reels/Shorts (30s–2min, **padrão**) · VSL/vídeo de vendas (3–15min) · Os dois.
    Se VSL: sugira intensidade *minimalista/equilibrado* e emojis *nunca* (tom de confiança) se a pessoa não escolheu diferente.
13. **Limpeza de erros de gravação** (frases repetidas, recomeços, "dois, dois", "hum" viram corte): Automática (**padrão**, mostra o que saiu e segue) · Revisar antes de cortar · Automática + encurtar pausas longas · Desligada (já mando o vídeo editado).
14. (opcional) **Onde ficam os vídeos brutos** e **câmera/celular** usados — só para a skill saber onde procurar e se precisa converter HEVC (iPhone, GoPro e DJI gravam em H.265 por padrão).

---

## Etapa 3 — Aplicar

### 3.1 `src/theme.ts` (em `<VT>/remotion`)
Edite **só** o bloco `MARCA` e o import da fonte:
- `accent` = cor escolhida.
- `accentSoft` = mistura 30% com branco; `accentDeep` = mistura 12% com preto. Calcule com:
  `node -e "const h='<HEX>'.replace('#','');const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));const mix=(t,k)=>'#'+c.map(v=>Math.round(v+(t-v)*k).toString(16).padStart(2,'0')).join('').toUpperCase();const L=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});const lum=0.2126*L[0]+0.7152*L[1]+0.0722*L[2];console.log(JSON.stringify({accentSoft:mix(255,0.3),accentDeep:mix(0,0.12),ink:lum>0.35?'#111111':'#FFFFFF'}))"`
- `ink` = resultado acima (texto preto em cores claras, branco em escuras).
- `legenda.caixa` = `"minusculas" | "normal" | "maiusculas"`; `legenda.tamanho`, `legenda.maxPalavras`, `legenda.posicaoY` = respostas.
- `legenda.contorno` = 7 (ou 8 se tamanho 80).
- `barraProgresso`, `sfx` = respostas.
- Fonte: troque `@remotion/google-fonts/Poppins` pelo pacote escolhido (nome sem espaços, ex.: `Montserrat`).

### 3.2 `perfil.md` (em `<SKILL>`)
Preencha todos os campos com as respostas e o ambiente detectado. **Por último** troque `configurado: não` por `configurado: sim (AAAA-MM-DD)`.

### 3.3 Placeholders da skill
Substitua em **todos** os arquivos `.md` de `<SKILL>` (SKILL.md e references/*.md, **exceto este setup.md**):
`{{VIDEO_TOOLS}}`, `{{PYTHON}}`, `{{DEVICE}}`, `{{IDIOMA}}`, `{{ENCODER_H264}}`, `{{CONCORRENCIA}}`.
Faça com um script Node (não com sed — barras invertidas de caminhos Windows se perdem):
```
node -e "const fs=require('fs'),p=require('path');const d=process.argv[1];const m=JSON.parse(process.argv[2]);const fs2=[p.join(d,'SKILL.md'),...fs.readdirSync(p.join(d,'references')).filter(f=>f.endsWith('.md')&&f!=='setup.md').map(f=>p.join(d,'references',f))];for(const f of fs2){let s=fs.readFileSync(f,'utf8');for(const[k,v]of Object.entries(m))s=s.split('{{'+k+'}}').join(v);fs.writeFileSync(f,s)}" "<SKILL>" "{\"VIDEO_TOOLS\":\"C:/video-tools\",\"PYTHON\":\"python\",\"DEVICE\":\"cpu\",\"IDIOMA\":\"pt\",\"ENCODER_H264\":\"libx264\",\"CONCORRENCIA\":\"4\"}"
```
(troque os valores pelos detectados; se o caminho do Python tiver espaços, coloque-o entre aspas no valor, ex.: `"\"C:/Program Files/Python312/python.exe\""` ou use `&` + aspas no PowerShell).
Depois confirme com uma busca por `{{` nesses arquivos — não pode sobrar nenhum.

---

## Etapa 4 — Validar e mostrar

Em `<VT>/remotion`:
1. `npx tsc --noEmit -p .` → tem que sair limpo.
2. Prévias da marca (uma de cada vez, nunca em paralelo):
   ```
   npx remotion still Catalogo <tmp>/setup-statement.png --frame=105 --scale=0.4 --log=error
   npx remotion still Catalogo <tmp>/setup-bignumber.png --frame=300 --scale=0.4 --log=error
   npx remotion still Catalogo <tmp>/setup-compare.png --frame=900 --scale=0.4 --log=error
   ```
   (o primeiro still demora mais: o Remotion baixa o Chrome dele.) Abra/leia as imagens e confira se a cor, a fonte e o contraste do texto nos selos ficaram bons. Se algo estiver ruim (cor apagada, texto ilegível no selo), ajuste e repita.
3. Mostre as prévias ao usuário (diga onde estão os PNGs) e pergunte se quer ajustar algo.
4. Ofereça renderizar o **catálogo completo** (~90s de vídeo com os 12 motions na marca dele):
   `npx remotion render Catalogo "../saida/CATALOGO de motions.mp4" --concurrency=<concorrência detectada> --crf=18 --log=error` (em background; avise que leva alguns minutos).

---

## Etapa 5 — Fechar
Resuma em poucas linhas: marca, estilo de legenda, intensidade, onde colocar os vídeos (pasta `entrada` dentro de video-tools) e como pedir uma edição:
> "edita o vídeo C:/…/meu-video.mp4"

Lembre que dá para refazer tudo dizendo **"configurar reels-editor"** de novo, ou mudar uma coisa só ("legenda maior", "troca a cor para verde").

Depois volte ao pedido original do usuário, se havia um (ex.: ele pediu para editar um vídeo e o setup rodou antes).
