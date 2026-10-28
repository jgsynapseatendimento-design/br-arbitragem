import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';

// O vídeo do Reel é opcional: só é referenciado se o arquivo existir em public/media.
const reelSources = ['webm', 'mp4']
  .map((ext) => `/media/reel-br-arbitragem.${ext}`)
  .filter((path) => existsSync(`public${path}`));

export default defineConfig({
  define: {
    __REEL_SOURCES__: JSON.stringify(reelSources),
  },
});
