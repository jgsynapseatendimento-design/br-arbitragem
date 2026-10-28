# BR Arbitragem Futevôlei — landing page

Página institucional da BR Arbitragem Futevôlei, com formulário de consulta de disponibilidade em quatro etapas (contato, evento, estrutura e revisão).

## Stack

- [Vite](https://vite.dev/) + HTML, CSS e JavaScript sem framework.
- Fontes: Fraunces (títulos) e Instrument Sans (texto), via Google Fonts.
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

## Estrutura

```
index.html                 marcação das sete seções
public/images/             logo, fotos da equipe e ícones (otimizados em WebP)
src/main.js                ponto de entrada
src/styles/                tokens, base, componentes e um arquivo por seção
src/js/nav.js              menu do cabeçalho em telas pequenas
src/js/faq.js              perguntas frequentes expansíveis
src/js/request/            formulário em etapas (validação, máscara, mensagem)
```
