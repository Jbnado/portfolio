export const SITE_URL = 'https://jbnado.dev';
export const DEFAULT_LOCALE = 'pt-br';
export const LOCALES = ['pt-br', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
