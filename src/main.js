import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/motion.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/game.css';
import './styles/about.css';
import './styles/service.css';
import './styles/reel.css';
import './styles/faq.css';
import './styles/request.css';
import './styles/footer.css';

import { initNav } from './js/nav.js';
import { initFaq } from './js/faq.js';
import { initRequestForm } from './js/request/form.js';
import { initMotion, initHeaderState } from './js/motion/motion.js';
import { initCourt } from './js/court/court.js';
import { initReel } from './js/reel.js';

const header = document.querySelector('[data-nav]');

initMotion();
initNav(header);
initHeaderState(header);
initFaq(document.querySelector('[data-faq]'));
initCourt(document.querySelector('[data-court]'));
initReel(document.querySelector('[data-reel]'));
initRequestForm(document.querySelector('[data-request]'));
