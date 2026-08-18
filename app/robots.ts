// app/robots.ts

import type { MetadataRoute } from 'next';
import { absoluteRoutes } from '@/lib/routes';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${absoluteRoutes.home}/sitemap.xml`,
  };
}