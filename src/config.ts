/**
 * ==========================================
 * ARQUIVO DE CONFIGURAÇÃO CENTRAL
 * ==========================================
 *
 * Este arquivo lê todas as configurações importantes
 * das Variáveis de Ambiente (process.env ou import.meta.env).
 *
 * Certifique-se de configurar as variáveis no seu ambiente de hospedagem
 * (ex: Dokploy) ou em um arquivo .env local.
 */

// Função auxiliar para garantir que as variáveis de ambiente sejam strings
const getEnv = (key: string): string => {
  // Assume-se que o projeto usa um bundler como Vite, que expõe variáveis
  // com o prefixo VITE_PUBLIC_ através de import.meta.env
  const value = import.meta.env[key];
  if (value === undefined) {
    // Para variáveis obrigatórias, você pode querer lançar um erro
    // throw new Error(`Variável de ambiente ${key} não definida.`);
    console.warn(`Variável de ambiente ${key} não definida. Usando string vazia.`);
    return "";
  }
  return String(value);
};

export const config = {
  // ==========================================
  // WEBHOOKS / APIs
  // ==========================================

  /**
   * URL principal do dashboard (n8n/Evolution)
   */
  DASHBOARD_WEBHOOK_URL: getEnv("VITE_PUBLIC_DASHBOARD_WEBHOOK_URL"),

  /**
   * URL para dados de consumo de tokens OpenAI
   */
  TOKEN_USAGE_WEBHOOK_URL: getEnv("VITE_PUBLIC_TOKEN_USAGE_WEBHOOK_URL"),

  // ==========================================
  // INTERVALOS DE ATUALIZAÇÃO
  // ==========================================

  /**
   * Intervalo de refresh automático do dashboard (em milissegundos)
   */
  REFRESH_INTERVAL_MS: Number(getEnv("VITE_PUBLIC_REFRESH_INTERVAL_MS")),

  // ==========================================
  // CONVERSÃO DE MOEDA
  // ==========================================

  /**
   * Taxa de conversão USD para BRL
   */
  USD_TO_BRL: Number(getEnv("VITE_PUBLIC_USD_TO_BRL")),

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================

  /**
   * Tempo máximo (em minutos) para considerar um erro como "recente"
   */
  ERROR_NOTIFICATION_THRESHOLD_MINUTES: Number(getEnv("VITE_PUBLIC_ERROR_NOTIFICATION_THRESHOLD_MINUTES")),

  /**
   * Volume do som de notificação (0.0 a 1.0)
   */
  NOTIFICATION_SOUND_VOLUME: Number(getEnv("VITE_PUBLIC_NOTIFICATION_SOUND_VOLUME")),

  // ==========================================
  // PWA INSTALL PROMPT
  // ==========================================

  /**
   * Tempo (em segundos) antes de mostrar o prompt de instalação PWA no desktop
   */
  PWA_PROMPT_DELAY_SECONDS: Number(getEnv("VITE_PUBLIC_PWA_PROMPT_DELAY_SECONDS")),

  // ==========================================
  // TEMA PADRÃO
  // ==========================================

  /**
   * Tema padrão ao carregar o app
   * Opções: "dark" | "light"
   */
  DEFAULT_THEME: getEnv("VITE_PUBLIC_DEFAULT_THEME") as "dark" | "light",
};

// Exporta tipos para uso em outros arquivos
export type Config = typeof config;
