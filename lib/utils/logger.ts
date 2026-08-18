// lib/utils/logger.ts
// Sistema de logging unificado.
// En producción, esto debería integrarse con Sentry/LogRocket/etc.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  slug?: string;
  id?: string | number;
  error?: unknown;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== 'production';

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = context?.component ? `[${context.component}]` : '';
  const action = context?.action ? ` ${context.action}` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefix}${action} ${message}`;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const formatted = formatMessage(level, message, context);
  
  // En producción, solo warn y error
  if (!isDev && (level === 'debug' || level === 'info')) return;
  
  const logFn = level === 'error' ? console.error
    : level === 'warn' ? console.warn
    : level === 'debug' ? console.debug
    : console.log;
  
  // En dev, agregar contexto como objeto para fácil inspección
  if (isDev && context) {
    logFn(formatted, context);
  } else {
    logFn(formatted);
  }
  
  // TODO: En producción, enviar a servicio externo (Sentry, DataDog, etc.)
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// Helper específico para logs de API
export const apiLogger = {
  fetch: (endpoint: string, params?: Record<string, unknown>) =>
    logger.debug('Fetching', { component: 'API', action: endpoint, ...params }),
  
  success: (endpoint: string, context?: LogContext) =>
    logger.debug('Success', { component: 'API', action: endpoint, ...context }),
  
  failure: (endpoint: string, error: unknown, context?: LogContext) =>
    logger.error('Failed', { component: 'API', action: endpoint, error, ...context }),
  
  timeout: (endpoint: string, ms: number) =>
    logger.warn(`Timeout after ${ms}ms`, { component: 'API', action: endpoint }),
};