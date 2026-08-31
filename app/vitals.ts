'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

/**
 * Reporta Core Web Vitals a servicio de analytics.
 *
 * En producción, esto debería enviarse a:
 * - Google Analytics 4
 * - Sentry Performance
 * - Vercel Analytics
 * - O servicio custom
 *
 * Métricas reportadas:
 * - LCP (Largest Contentful Paint): < 2.5s es bueno
 * - FID (First Input Delay): < 100ms es bueno
 * - CLS (Cumulative Layout Shift): < 0.1 es bueno
 * - FCP (First Contentful Paint): < 1.8s es bueno
 * - TTFB (Time to First Byte): < 800ms es bueno
 */
export function reportWebVitals(metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}) {
  // En desarrollo, solo loguear
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Web Vital', {
      component: 'WebVitals',
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
    return;
  }

  // En producción, enviar a analytics
  // TODO: Integrar con servicio de analytics real
  try {
    // Ejemplo: Google Analytics 4
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_rating: metric.rating,
    // });

    // Ejemplo: fetch a endpoint custom
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    // });
  } catch (error) {
    // Silencioso: analytics no debe afectar UX
    logger.debug('Failed to report web vital', {
      component: 'WebVitals',
      metric: metric.name,
      error,
    });
  }
}

/**
 * Hook para inicializar reporte de Web Vitals en client components.
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lazy-load web-vitals para no afectar bundle size
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onLCP(reportWebVitals);
      onFCP(reportWebVitals);
      onTTFB(reportWebVitals);
    }).catch((error) => {
      logger.debug('Failed to load web-vitals', {
        component: 'WebVitals',
        error,
      });
    });
  }, []);
}

export function WebVitalsReporter() {
  useWebVitals();
  return null;
}
