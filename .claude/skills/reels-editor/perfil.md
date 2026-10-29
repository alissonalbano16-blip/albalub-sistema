# Perfil de edição

configurado: sim (2026-10-28)

> Este arquivo é preenchido pelo setup (`references/setup.md`). Enquanto estiver `configurado: não`, a skill roda o setup antes de editar qualquer vídeo.

## Ambiente
- Pasta video-tools: /home/user/albalub-sistema/video-tools (sessão na nuvem do Claude Code, Linux, 4 núcleos, sem GPU)
- Python: python3 (rode `pip install faster-whisper` se a sessão for nova e o módulo não existir; o `npm install` em `video-tools/remotion` também precisa ser refeito em sessão nova)
- Transcrição: idioma pt · device cpu · o modelo Whisper vem do huggingface.co, que precisa estar liberado no acesso à rede do ambiente
- Encoder H.264: libx264
- Concorrência do render: 2
- Navegador: Chromium local em /opt/pw-browsers (configurado em `remotion/remotion.config.ts`); fonte servida de `remotion/public/fonts` (o Chrome do render não baixa do fonts.gstatic.com aqui)

## Marca
- Cor de destaque: #3B82F6 (azul) · soft #76A8F9 · deep #3472D8
- Cor do texto sobre o destaque (ink): #FFFFFF
- Fonte: Poppins (local, pesos 500–900)

## Legendas
- Caixa: minúsculas
- Tamanho: 66 (média)
- Palavras por tela: 3
- Posição: 1300 (meio-baixo)

## Estilo
- Intensidade: equilibrado
- Emojis: raros (só em punchlines)
- Efeitos sonoros: sim
- Barra de progresso: sim
- Formato principal: Reels/Shorts (30s–2min)
- Limpeza de erros: automática

## Conteúdo
- Nicho: lubrificantes / automotivo (venda de óleos e lubrificantes)
- Público: oficinas mecânicas, frotistas e motoristas
- Pasta dos vídeos brutos: /home/user/albalub-sistema/video-tools/entrada
- Câmera/celular: —

## Aprendizados
<!-- O que o usuário gostou / não gostou nas edições. A skill adiciona aqui ao receber feedback. -->
- Projeto VEM PRA RUA (ação social mensal: alimentos, roupas, dinheiro para refeições): usa azul-claro #7DD3FC (soft #A4E0FD, deep #6EBADE, ink #111111) em vez do azul da Albalub. Para re-renderizar, troque o bloco MARCA em src/theme.ts e volte depois. Contato: WhatsApp e PIX (85) 98179-6430, titular Alisson Albano Ribeiro Santos.
