/**
 * Número oficial de WhatsApp da equipe (somente dígitos, com DDI e DDD).
 * Definido pela variável de ambiente VITE_WHATSAPP_NUMBER no momento do build.
 * Enquanto não houver número confirmado, o envio direto fica desativado.
 */
const raw = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const WHATSAPP_NUMBER = /^\d{12,13}$/.test(raw) ? raw : '';
export const IS_DEV = import.meta.env.DEV;
