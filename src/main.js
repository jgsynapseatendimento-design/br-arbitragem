import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/about.css';
import './styles/service.css';
import './styles/faq.css';
import './styles/request.css';
import './styles/footer.css';

import { initNav } from './js/nav.js';
import { initFaq } from './js/faq.js';
import { initRequestForm } from './js/request/form.js';

initNav(document.querySelector('[data-nav]'));
initFaq(document.querySelector('[data-faq]'));
initRequestForm(document.querySelector('[data-request]'));
