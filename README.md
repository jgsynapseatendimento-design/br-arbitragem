# BR Arbitragem Futevôlei — landing page

Página institucional da BR Arbitragem Futevôlei, com formulário de consulta de disponibilidade em quatro etapas (contato, evento, estrutura e revisão).

## Stack

- [Vite](https://vite.dev/) + HTML, CSS e JavaScript sem framework.
- [GSAP](https://gsap.com/) 3.13 com ScrollTrigger, SplitText e DrawSVG para o motion design.
- Fontes (Google Fonts): Archivo (títulos condensados e texto), Instrument Serif (acentos em itálico) e JetBrains Mono (numeração e microtexto).
- Sem backend: os dados do formulário ficam apenas no navegador.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm run build    # gera dist/
npm run preview  # serve o build
```

## WhatsApp da equipe

O envio direto pelo WhatsApp depende da variável de ambiente `VITE_WHATSAPP_NUMBER`
(somente dígitos, com DDI e DDD). Ela é lida no momento do build.

- Local: copie `.env.example` para `.env.local` e preencha o número.
- Vercel: Project Settings → Environment Variables → `VITE_WHATSAPP_NUMBER`, depois faça um novo deploy.

Enquanto o número não estiver configurado, a etapa de revisão mostra um aviso e oferece
apenas "Copiar mensagem". Nenhuma mensagem é enviada sem o clique do usuário.

## Vídeo do Reel (seção "Em quadra")

O link do Instagram não pode ser usado como fonte de um `<video>`. Para o vídeo tocar no
site automaticamente (sem som, em loop, só quando visível), coloque o arquivo original em:

```
public/media/reel-br-arbitragem.mp4    (H.264, vertical 9:16)
public/media/reel-br-arbitragem.webm   (opcional, VP9)
```

O build detecta o arquivo sozinho (`vite.config.js`); não é preciso mudar código. Sem o
arquivo, a seção mostra a capa e o botão "Assistir aqui", que carrega o player oficial de
incorporação do Instagram somente quando a pessoa clica, além do link para abrir o Reel.

## Quadra animada (seção "O jogo")

SVG em `index.html` (quadra, rede, dois jogadores articulados e bola). A coreografia fica em
`src/js/court/court.js` e as poses em `src/js/court/poses.js`: os pontos de contato da bola
(pé e testa) são calculados a partir das poses, então mudar um ângulo mantém a sincronia.
A cena só anima quando está na tela, tem botão de pausa e fica estática para quem prefere
movimento reduzido.

## Estrutura

```
index.html                 marcação das sete seções
public/images/             logo, fotos da equipe e ícones (otimizados em WebP)
src/main.js                ponto de entrada
src/styles/                tokens, base, componentes, estados de animação e um arquivo por seção
src/js/motion/motion.js    abertura do hero, revelações com ScrollTrigger, cabeçalho fixo
src/js/court/              quadra animada (coreografia e poses)
src/js/reel.js             vídeo do Reel / incorporação do Instagram
src/js/nav.js              menu do cabeçalho em telas pequenas
src/js/faq.js              perguntas frequentes expansíveis
src/js/request/            formulário em etapas (validação, máscara, mensagem)
```
