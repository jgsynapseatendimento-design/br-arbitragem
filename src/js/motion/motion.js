import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;

/** Cabeçalho ganha fundo sólido depois que o hero sai de cena. */
export function initHeaderState(header) {
  if (!header) return;
  ScrollTrigger.create({
    start: () => window.innerHeight * 0.6,
    end: 'max',
    toggleClass: { targets: header, className: 'is-solid' },
  });
}

/** Abertura do hero: marca → título por linhas → apoio → CTAs; a foto ganha profundidade. */
function heroIntro() {
  const q = (sel) => document.querySelectorAll(sel);
  const image = document.querySelector('[data-hero-image]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo(image, { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
    .to(q('[data-intro="brand"]'), { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.15)
    .to(q('[data-intro="kicker"]'), { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.3)
    .to(q('.hero__line > span'), { y: 0, yPercent: 0, duration: 1.15, stagger: 0.12 }, 0.35)
    .to(q('[data-intro="lead"]'), { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0.95)
    .fromTo(q('[data-intro="cta"]'), { y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to(q('[data-intro="meta"]'), { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1.2)
    .to(q('.hero__meta-rule'), { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 1.2);

  // Leve parallax na foto enquanto o hero sai da tela.
  gsap.to(image, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/** Títulos revelados linha a linha, com máscara. */
function splitHeadings() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
    });
  });
}

function reveals() {
  const enter = (trigger) => ({ trigger, start: 'top 88%', once: true });

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', scrollTrigger: enter(el) });
  });

  gsap.utils.toArray('[data-stagger]').forEach((list) => {
    gsap.from(list.children, {
      autoAlpha: 0,
      y: 16,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: enter(list),
    });
  });

  // Fotografias: máscara de baixo para cima e um zoom muito sutil.
  gsap.utils.toArray('[data-media-reveal]').forEach((fig) => {
    const img = fig.querySelector('img');
    gsap
      .timeline({ scrollTrigger: { trigger: fig, start: 'top 82%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0);
  });

  // Serviço: itens em sequência, divisórias que se desenham.
  const list = document.querySelector('[data-service-list]');
  if (list) {
    const items = list.querySelectorAll('.service-list__item');
    gsap
      .timeline({ scrollTrigger: { trigger: list, start: 'top 80%', once: true } })
      .from(list.querySelectorAll('.service-list__rule'), { scaleX: 0, duration: 1, ease: 'power3.inOut', stagger: 0.15 }, 0)
      .from(
        [...items].map((li) => li.querySelectorAll('.service-list__num, .service-list__title, .service-list__text')),
        { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
        0.2,
      );
  }

  // Reel: moldura entra com um deslocamento curto.
  const reel = document.querySelector('[data-reel]');
  if (reel) {
    gsap.from(reel, { autoAlpha: 0, y: 48, duration: 1.2, ease: 'expo.out', scrollTrigger: enter(reel) });
  }

  // Assinatura do rodapé sobe por trás da linha.
  const wordmark = document.querySelector('[data-wordmark]');
  if (wordmark) {
    gsap.from(wordmark, { yPercent: 40, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: enter(wordmark) });
  }
}

export function initMotion() {
  clearTimeout(window.__motionFallback);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.classList.add('motion');
    heroIntro();
    splitHeadings();
    reveals();
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    root.classList.remove('motion');
  });

  // Fontes alteram a altura das linhas: recalcula as posições quando terminarem de carregar.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
