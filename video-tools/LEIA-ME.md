# Reels Editor — kit para Claude Code

Edição de Reels, Shorts, TikTok e VSL vertical feita pelo Claude. Você manda o vídeo e ele faz o resto:

- **Limpeza de erros**: se você repetiu uma frase, recomeçou ou travou numa palavra, ele corta e deixa só o take certo.
- **Legendas dinâmicas**: palavra por palavra, com a palavra falada destacada na sua cor.
- **Roteiro de cenas**: ele lê a fala e escolhe o que mostrar em cada trecho.
- **12 motions animados** sincronizados com o que você fala: frase digitada, número gigante, gráfico, antes×depois, linha do tempo, oferta, perfil crescendo e outros.
- **Dois layouts**: tela dividida (você embaixo, animação em cima) ou animação em tela cheia com seu rosto numa bolha.
- **Acabamento**: efeitos sonoros, light leaks e emojis animados.
- **Render final** em MP4 1080×1920.

Na primeira vez o Claude faz algumas perguntas (cor da sua marca, fonte, estilo de legenda, nicho, intensidade da edição…) e deixa tudo com a sua cara.

---

## O que vem no kit

```
reels-editor-kit/
├── skill/reels-editor/   ← a skill (instruções para o Claude)
└── video-tools/          ← o editor (projeto Remotion + scripts de transcrição)
    ├── entrada/          ← coloque seus vídeos aqui (opcional)
    ├── saida/            ← os vídeos prontos saem aqui
    └── remotion/         ← motor de edição
```

## Requisitos

- **Claude Code**, no terminal ou na extensão do VS Code ou JetBrains. A skill roda comandos no seu computador, por isso não funciona no chat do claude.ai.
- **Node.js 18+**, **FFmpeg** e **Python 3.9+** com `faster-whisper`, usado para a transcrição. Se faltar algum, o Claude detecta durante a configuração e oferece instalar.
- Uns 3 GB livres, que incluem as dependências e o modelo de transcrição.
- Windows, macOS ou Linux.

## Instalação (2 minutos)

1. **Descompacte** o kit.
2. **Copie a pasta `skill/reels-editor`** para a pasta de skills do Claude Code:
   - Windows: `C:\Users\<seu-usuário>\.claude\skills\reels-editor`
   - macOS/Linux: `~/.claude/skills/reels-editor`

   (crie a pasta `skills` se ela não existir)
3. **Coloque a pasta `video-tools`** num lugar fixo, por exemplo `C:\video-tools` ou `~/video-tools`.
4. Abra o Claude Code e diga:

   > **configurar reels-editor**

   Ele vai checar o computador, instalar o que faltar (sempre pedindo sua permissão), fazer as perguntas de estilo e gerar uma prévia com a sua marca.

## Como usar

Depois de configurado, é só pedir:

> edita o vídeo C:\Users\eu\Videos\meu-reels.mp4

O Claude transcreve, corta os erros de gravação, mostra o roteiro de cenas, monta, confere prévias e entrega o MP4 na pasta `video-tools/saida`.

Ajustes depois são conversa: "legenda maior", "essa cena em tela cheia", "menos emoji", "troca a cor para verde", "quero ver todos os motions".

Para refazer a configuração inteira: **"configurar reels-editor"** de novo.

## Dicas

- Grave na vertical (9:16). Errou? Repita a frase inteira desde o começo, sem parar a gravação. A skill corta a versão errada e mantém a última.
- Ela não decide sozinha o que é ênfase ("muito, muito") e o que é erro. Os casos duvidosos são revisados pelo Claude, e você vê a lista do que saiu.
- Vídeos em HEVC/H.265 (padrão de iPhone, GoPro e DJI) são convertidos automaticamente.
- A transcrição na CPU leva mais ou menos o tempo do vídeo. Com placa NVIDIA é bem mais rápida.
- Não rode duas renderizações ao mesmo tempo.

Créditos dos sons e emojis em [CREDITOS.md](CREDITOS.md).
