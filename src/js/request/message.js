/** Estrutura dos dados exibidos na revisão e na mensagem do WhatsApp. */
export const GROUPS = [
  {
    step: 1,
    title: 'Contato',
    fields: [
      ['nome', 'Responsável'],
      ['whatsapp', 'WhatsApp'],
    ],
  },
  {
    step: 2,
    title: 'Evento',
    fields: [
      ['evento', 'Evento'],
      ['cidade', 'Cidade/UF'],
      ['local', 'Local/arena'],
      ['data', 'Data prevista'],
      ['duracao', 'Duração'],
    ],
  },
  {
    step: 3,
    title: 'Estrutura',
    fields: [
      ['quadras', 'Quadras'],
      ['categorias', 'Categorias/Formato'],
      ['alimentacao', 'Alimentação'],
      ['hospedagem', 'Hospedagem'],
      ['observacoes', 'Informações adicionais'],
    ],
  },
];

export function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

/** Valor pronto para exibição (string vazia quando não informado). */
export function displayValue(key, data) {
  const value = (data[key] ?? '').toString().trim();
  if (key === 'data') return formatDate(value);
  return value;
}

export function buildMessage(data) {
  const lines = ['Olá! Gostaria de consultar a disponibilidade da BR Arbitragem para um evento.'];

  for (const group of GROUPS) {
    const rows = group.fields
      .map(([key, label]) => [label, displayValue(key, data)])
      .filter(([, value]) => value);
    if (!rows.length) continue;
    lines.push('', `*${group.title}*`);
    for (const [label, value] of rows) lines.push(`${label}: ${value}`);
  }

  lines.push('', 'Aguardo o retorno para alinharmos os próximos passos. Obrigado!');
  return lines.join('\n');
}

export function whatsappUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
