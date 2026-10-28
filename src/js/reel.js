/**
 * Seção "Em quadra". Com o arquivo original do Reel em public/media (detectado no build,
 * ver vite.config.js), o vídeo toca sem som, em loop, enquanto estiver visível. Sem o
 * arquivo, a seção mostra a capa e carrega o player oficial de incorporação do Instagram
 * somente quando a pessoa pede.
 */
/* global __REEL_SOURCES__ */
const SOURCES = typeof __REEL_SOURCES__ !== 'undefined' ? __REEL_SOURCES__ : [];
const INSTAGRAM_EMBED = 'https://www.instagram.com/reel/DXzQdttt2gp/embed/';

export function initReel(root) {
  if (!root) return;
  const screen = root.querySelector('[data-reel-screen]');
  const poster = root.querySelector('[data-reel-poster]');
  const loadButton = root.querySelector('[data-reel-load]');
  const status = root.querySelector('[data-reel-status]');
  const controls = root.querySelector('[data-reel-controls]');
  const playPause = root.querySelector('[data-reel-playpause]');
  const mute = root.querySelector('[data-reel-mute]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const showEmbedOption = () => {
    loadButton.hidden = false;
    loadButton.addEventListener(
      'click',
      () => {
        const frame = document.createElement('iframe');
        frame.src = INSTAGRAM_EMBED;
        frame.title = 'Reel da BR Arbitragem no Instagram';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        frame.setAttribute('allowfullscreen', '');
        screen.replaceChildren(frame);
        screen.classList.add('is-embed');
        status.textContent = 'Reproduzindo pelo Instagram';
        frame.focus?.();
      },
      { once: true },
    );
  };

  if (!SOURCES.length) {
    showEmbedOption();
    return;
  }

  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = poster.currentSrc || poster.src;
  video.setAttribute('aria-label', 'Vídeo: a equipe BR Arbitragem em quadra');
  for (const src of SOURCES) {
    const source = document.createElement('source');
    source.src = src;
    source.type = src.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    video.append(source);
  }

  let userPaused = reduced.matches;
  let visible = false;

  const setButtons = () => {
    playPause.textContent = video.paused ? 'Reproduzir' : 'Pausar';
    playPause.setAttribute('aria-pressed', String(!video.paused));
    mute.textContent = video.muted ? 'Ativar som' : 'Desativar som';
    mute.setAttribute('aria-pressed', String(video.muted));
  };

  const tryPlay = () => {
    video.play().catch(() => {
      // Autoplay bloqueado pelo navegador: a pessoa inicia pelo botão.
      userPaused = true;
      setButtons();
    });
  };

  const sync = () => {
    if (visible && !userPaused) tryPlay();
    else video.pause();
  };

  video.addEventListener('play', setButtons);
  video.addEventListener('pause', setButtons);
  video.addEventListener('volumechange', setButtons);
  video.querySelector('source:last-of-type').addEventListener('error', () => {
    // Arquivo inválido ou ausente no servidor: volta para a capa + Instagram.
    video.remove();
    controls.hidden = true;
    screen.classList.remove('is-video');
    screen.prepend(poster);
    showEmbedOption();
  });

  playPause.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else tryPlay();
  });
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
  });

  poster.remove();
  screen.prepend(video);
  screen.classList.add('is-video');
  controls.hidden = false;
  status.textContent = 'BR Arbitragem em quadra';
  setButtons();

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.5 },
  ).observe(screen);
}
