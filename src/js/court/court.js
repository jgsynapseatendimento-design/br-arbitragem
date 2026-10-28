import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { POSES, JOINTS, footContact, headContact } from './poses.js';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const GROUND_Y = 447; // linha do chão na profundidade dos jogadores (sombra da bola)
const APEX_Y = 92; // altura máxima da bola na tela, acima da fita da rede
const FLIGHT = 1.25; // segundos de voo em cada travessia

const MOBILE_VIEWBOX = '230 56 740 564';
const DESKTOP_VIEWBOX = '0 0 1200 640';

function readPlayer(svg, name) {
  const root = svg.querySelector(`[data-player="${name}"]`);
  const match = /translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)/.exec(root.getAttribute('transform'));
  const [, x, y, sx, sy] = match.map(Number);
  const joints = {};
  for (const j of JOINTS) joints[j] = root.querySelector(`[data-j="${j}"]`);
  return {
    body: root.querySelector('[data-j="body"]'),
    shadow: root.querySelector('[data-shadow]'),
    joints,
    state: { ...POSES.neutral },
    toScreen: (p) => ({ x: x + sx * p.x, y: y + sy * p.y }),
  };
}

function renderPlayer(p) {
  const s = p.state;
  for (const j of JOINTS) p.joints[j].setAttribute('transform', `rotate(${s[j].toFixed(2)})`);
  p.body.setAttribute('transform', `translate(0 ${s.bodyY.toFixed(2)})`);
  // No salto a sombra encolhe e clareia.
  const lift = Math.max(0, -s.bodyY) / 30;
  p.shadow.setAttribute('transform', `scale(${(1 - lift * 0.35).toFixed(3)} 1)`);
  p.shadow.style.opacity = (1 - lift * 0.5).toFixed(3);
}

/** Trajetória balística: x linear no tempo, y em parábola com o ápice sobre a rede. */
function arc(from, to, t) {
  const lift = (from.y + to.y) / 2 - APEX_Y;
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t - 4 * lift * t * (1 - t),
  };
}

export function initCourt(figure) {
  if (!figure) return;
  const svg = figure.querySelector('[data-court-svg]');
  const toggle = figure.querySelector('[data-court-toggle]');
  const left = readPlayer(svg, 'left');
  const right = readPlayer(svg, 'right');
  const ballEl = svg.querySelector('[data-ball]');
  const spinEl = svg.querySelector('[data-ball-spin]');
  const ballShadow = svg.querySelector('[data-ball-shadow]');

  // Pontos de contato calculados a partir das próprias poses do golpe.
  const kickPoint = left.toScreen(footContact(POSES.kickPeak));
  const headPoint = right.toScreen(headContact(POSES.headPeak));

  const ball = { x: kickPoint.x, y: kickPoint.y, spin: 0 };
  left.state = { ...POSES.kickPeak };

  const render = () => {
    renderPlayer(left);
    renderPlayer(right);
    ballEl.setAttribute('transform', `translate(${ball.x.toFixed(2)} ${ball.y.toFixed(2)})`);
    spinEl.setAttribute('transform', `rotate(${ball.spin.toFixed(1)})`);
    const height = Math.max(0, GROUND_Y - ball.y);
    const k = Math.min(1, height / 340);
    ballShadow.setAttribute('cx', ball.x.toFixed(2));
    ballShadow.setAttribute('cy', GROUND_Y);
    ballShadow.setAttribute('rx', (13 - k * 6).toFixed(2));
    ballShadow.style.opacity = (0.9 - k * 0.6).toFixed(3);
  };

  const flight = (from, to, spinBy) => {
    const p = { t: 0 };
    const startSpin = { v: 0 };
    return gsap.to(p, {
      t: 1,
      duration: FLIGHT,
      ease: 'none',
      onStart: () => {
        startSpin.v = ball.spin;
      },
      onUpdate: () => {
        Object.assign(ball, arc(from, to, p.t));
        ball.spin = startSpin.v + spinBy * p.t;
      },
    });
  };

  const pose = (player, name, duration, ease) => gsap.to(player.state, { ...POSES[name], duration, ease });

  // Uma troca completa (2,5 s): chute da esquerda → cabeceio da direita → volta ao pé da
  // esquerda. O último quadro é idêntico ao primeiro, então o loop não tem salto.
  const rally = gsap.timeline({ repeat: -1, paused: true, onUpdate: render });
  rally
    .add(flight(kickPoint, headPoint, 540), 0)
    .add(pose(left, 'neutral', 0.5, 'power2.out'), 0.05)
    .add(pose(right, 'crouch', 0.4, 'sine.inOut'), 0.45)
    .add(pose(right, 'headPrep', 0.2, 'power1.in'), 0.85)
    .add(pose(right, 'headPeak', 0.2, 'power2.out'), 1.05)
    .add(flight(headPoint, kickPoint, -540), FLIGHT)
    .add(pose(right, 'neutral', 0.45, 'power2.inOut'), FLIGHT)
    .add(pose(left, 'kickWind', 0.45, 'sine.inOut'), 1.85)
    .add(pose(left, 'kickPeak', 0.2, 'power2.in'), 2.3);
  render();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let inView = false;

  const setToggle = () => {
    toggle.textContent = userPaused ? 'Retomar animação' : 'Pausar animação';
    toggle.setAttribute('aria-pressed', String(userPaused));
  };

  const sync = () => {
    if (inView && !userPaused && !reduced.matches) rally.play();
    else rally.pause();
  };

  if (reduced.matches) {
    // Quadro estático: bola no alto, a caminho do cabeceio.
    rally.progress(0.22).pause();
    render();
    toggle.hidden = true;
    return;
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    setToggle();
    sync();
  });
  setToggle();

  // Ajusta o enquadramento no celular para os jogadores ficarem maiores.
  const narrow = window.matchMedia('(max-width: 700px)');
  const frame = () => svg.setAttribute('viewBox', narrow.matches ? MOBILE_VIEWBOX : DESKTOP_VIEWBOX);
  frame();
  narrow.addEventListener('change', () => {
    frame();
    ScrollTrigger.refresh();
  });

  // Entrada da cena: linhas da quadra se desenham, jogadores e bola surgem.
  const lines = svg.querySelectorAll('[data-draw]');
  const actors = svg.querySelectorAll('.player, [data-ball], [data-ball-shadow]');
  gsap.set(actors, { autoAlpha: 0 });
  const intro = gsap
    .timeline({ paused: true })
    .from(lines, { drawSVG: '0%', duration: 1.2, ease: 'power2.inOut', stagger: 0.15 })
    .to(actors, { autoAlpha: 1, duration: 0.6, ease: 'power1.out', stagger: 0.08 }, '-=0.5');

  ScrollTrigger.create({
    trigger: figure,
    start: 'top 80%',
    end: 'bottom 10%',
    onEnter: () => intro.play(),
    onEnterBack: () => intro.play(),
    onToggle: (self) => {
      inView = self.isActive;
      sync();
    },
  });

  return () => rally.kill();
}
