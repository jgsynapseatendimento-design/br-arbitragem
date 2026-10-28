/** Formatação e validação de telefone brasileiro: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX. */
export function onlyDigits(value) {
  return String(value).replace(/\D/g, '');
}

export function formatPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

export function isValidPhone(value) {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (d[0] === '0' || d[1] === '0') return false;
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}

/** Aplica a máscara preservando a posição do cursor em relação aos dígitos. */
export function attachPhoneMask(input) {
  input.addEventListener('input', () => {
    const caret = input.selectionStart ?? input.value.length;
    const digitsBeforeCaret = onlyDigits(input.value.slice(0, caret)).length;
    const formatted = formatPhone(input.value);
    input.value = formatted;

    let pos = 0;
    let seen = 0;
    while (pos < formatted.length && seen < digitsBeforeCaret) {
      if (/\d/.test(formatted[pos])) seen += 1;
      pos += 1;
    }
    if (document.activeElement === input) input.setSelectionRange(pos, pos);
  });
}
