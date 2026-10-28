import { WHATSAPP_NUMBER, IS_DEV } from './config.js';
import { attachPhoneMask, isValidPhone } from './phone.js';
import { GROUPS, buildMessage, displayValue, whatsappUrl } from './message.js';

const TOTAL_STEPS = 4;

function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Regras de validação por etapa. Cada regra devolve a mensagem de erro ou ''. */
const RULES = {
  1: {
    nome: (v) => (v.trim().length >= 2 ? '' : 'Informe o nome do responsável.'),
    whatsapp: (v) => {
      if (!v.trim()) return 'Informe um WhatsApp para contato.';
      return isValidPhone(v) ? '' : 'Informe um número válido com DDD, no formato (DD) 9XXXX-XXXX.';
    },
  },
  2: {
    evento: (v) => (v.trim() ? '' : 'Informe o nome do evento.'),
    cidade: (v) => (v.trim() ? '' : 'Informe a cidade e o estado do evento.'),
    data: (v) => (!v || v >= todayIso() ? '' : 'A data prevista não pode estar no passado.'),
  },
  3: {
    quadras: (v) => {
      if (!v) return '';
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 99 ? '' : 'Informe um número inteiro entre 1 e 99.';
    },
  },
};

export function initRequestForm(panel) {
  if (!panel) return;

  const form = panel.querySelector('[data-request-form]');
  const steps = [...form.querySelectorAll('[data-step]')];
  const indicators = [...panel.querySelectorAll('[data-step-indicator]')];
  const review = form.querySelector('[data-review]');
  const messageBox = form.querySelector('[data-message]');
  const missingNotice = form.querySelector('[data-whatsapp-missing]');
  const devHint = form.querySelector('[data-dev-hint]');
  const whatsappLink = form.querySelector('[data-whatsapp-link]');
  const copyButton = form.querySelector('[data-copy]');
  const status = form.querySelector('[data-status]');

  let current = 1;
  let returnToReview = false;
  const touched = new Set();

  form.querySelector('[name="data"]').min = todayIso();
  attachPhoneMask(form.querySelector('[name="whatsapp"]'));

  const getData = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    for (const key of Object.keys(data)) data[key] = String(data[key]).trim();
    return data;
  };

  const setError = (name, message) => {
    const input = form.elements.namedItem(name);
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (error) error.textContent = message;
    if (input && 'setAttribute' in input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  };

  const validateStep = (step) => {
    const rules = RULES[step] || {};
    let firstInvalid = null;
    for (const [name, rule] of Object.entries(rules)) {
      const input = form.elements.namedItem(name);
      const message = rule(input.value);
      setError(name, message);
      touched.add(name);
      if (message && !firstInvalid) firstInvalid = input;
    }
    return firstInvalid;
  };

  // Revalida o campo enquanto o usuário corrige um erro já exibido.
  form.addEventListener('input', (event) => {
    const { name } = event.target;
    if (!touched.has(name)) return;
    const rule = RULES[current]?.[name];
    if (rule) setError(name, rule(event.target.value));
  });

  form.addEventListener(
    'blur',
    (event) => {
      const { name, value } = event.target;
      const rule = RULES[current]?.[name];
      if (!rule || !value) return;
      touched.add(name);
      setError(name, rule(value));
    },
    true,
  );

  const scrollPanelIntoView = () => {
    const top = panel.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const goTo = (step, { focus = true } = {}) => {
    current = step;
    steps.forEach((el) => {
      el.hidden = Number(el.dataset.step) !== step;
    });
    indicators.forEach((el) => {
      const n = Number(el.dataset.stepIndicator);
      el.classList.toggle('is-done', n < step);
      if (n === step) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });

    const next = steps[step - 1].querySelector('[data-next]');
    if (next) next.textContent = returnToReview ? 'Salvar e revisar' : step === 3 ? 'Revisar' : 'Continuar';

    if (step === TOTAL_STEPS) renderReview();
    if (focus) {
      scrollPanelIntoView();
      steps[step - 1].querySelector('.step__title').focus({ preventScroll: true });
    }
  };

  function renderReview() {
    const data = getData();
    review.replaceChildren(
      ...GROUPS.map((group) => {
        const section = document.createElement('div');
        section.className = 'review__group';

        const head = document.createElement('div');
        head.className = 'review__head';
        const title = document.createElement('p');
        title.className = 'eyebrow';
        title.textContent = group.title;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'review__edit';
        edit.dataset.edit = String(group.step);
        edit.textContent = 'Editar';
        edit.setAttribute('aria-label', `Editar ${group.title.toLowerCase()}`);
        head.append(title, edit);

        const list = document.createElement('dl');
        list.className = 'review__list';
        for (const [key, label] of group.fields) {
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          const value = displayValue(key, data);
          dd.textContent = value || 'Não informado';
          if (!value) dd.classList.add('is-empty');
          list.append(dt, dd);
        }

        section.append(head, list);
        return section;
      }),
    );

    const message = buildMessage(data);
    messageBox.textContent = message;
    status.textContent = '';

    if (WHATSAPP_NUMBER) {
      whatsappLink.href = whatsappUrl(WHATSAPP_NUMBER, message);
      whatsappLink.hidden = false;
      missingNotice.hidden = true;
      copyButton.classList.replace('btn--primary', 'btn--secondary');
    } else {
      whatsappLink.hidden = true;
      whatsappLink.removeAttribute('href');
      missingNotice.hidden = false;
      if (IS_DEV) {
        devHint.hidden = false;
        devHint.textContent =
          '[dev] Defina VITE_WHATSAPP_NUMBER em .env.local (somente dígitos, com DDI e DDD) para ativar o envio direto. Este aviso não aparece em produção.';
      }
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (current >= TOTAL_STEPS) return;
    const invalid = validateStep(current);
    if (invalid) {
      invalid.focus();
      return;
    }
    const target = returnToReview ? TOTAL_STEPS : current + 1;
    if (target === TOTAL_STEPS) returnToReview = false;
    goTo(target);
  });

  form.addEventListener('click', (event) => {
    const back = event.target.closest('[data-back]');
    if (back) {
      returnToReview = false;
      goTo(Math.max(1, current - 1));
      return;
    }

    const edit = event.target.closest('[data-edit]');
    if (edit) {
      returnToReview = true;
      goTo(Number(edit.dataset.edit));
      return;
    }

    if (event.target.closest('[data-copy]')) {
      copyMessage();
      return;
    }

    if (event.target.closest('[data-whatsapp-link]')) {
      status.textContent =
        'O WhatsApp foi aberto com a mensagem pronta. Confira e envie por lá; a equipe responde pelo mesmo canal.';
      return;
    }

    if (event.target.closest('[data-reset]')) {
      form.reset();
      touched.clear();
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      form.querySelectorAll('[data-error-for]').forEach((el) => {
        el.textContent = '';
      });
      returnToReview = false;
      goTo(1);
    }
  });

  async function copyMessage() {
    const text = messageBox.textContent;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Mensagem copiada. Cole no WhatsApp da equipe para enviar.';
    } catch {
      // Sem acesso à área de transferência: seleciona o texto para cópia manual.
      const range = document.createRange();
      range.selectNodeContents(messageBox);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Não foi possível copiar automaticamente. O texto foi selecionado para você copiar.';
    }
  }

  goTo(1, { focus: false });
}
