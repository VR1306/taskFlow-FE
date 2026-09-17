import type { Metadata } from 'next';
import { env } from '@/config/env';

export interface PageMetadataOptions {
  /** Page specific title (e.g., 'Sign In', 'Overview', 'Team Settings') */
  title: string;
  /** Page description (falls back to default app description if omitted) */
  description?: string;
  /** Flow or module name (e.g., 'Auth', 'Dashboard', 'Admin', 'Tasks') */
  flow?: string;
  /** Set to true to prevent search engines from indexing the page (recommended for auth & protected dashboards) */
  noIndex?: boolean;
  /** Specific SEO keywords */
  keywords?: string[];
  /** Canonical URL if applicable */
  canonicalUrl?: string;
  /** OpenGraph / Social preview image path */
  image?: string;
}

export const SITE_CONFIG = {
  name: 'TaskFlow',
  defaultDescription: 'TaskFlow - Streamline your tasks and workflows effortlessly.',
  defaultKeywords: [
    'TaskFlow',
    'Task Management',
    'Workflow Automation',
    'Project Management',
    'Team Productivity',
  ],
  siteUrl: env.APP_URL,
};

/**
 * Common metadata generator for all TaskFlow pages.
 * Supports page-wise and flow-wise title formatting and SEO/Robots configuration.
 */
export function constructMetadata({
  title,
  description = SITE_CONFIG.defaultDescription,
  flow,
  noIndex = false,
  keywords = SITE_CONFIG.defaultKeywords,
  canonicalUrl,
  image = '/icon.svg',
}: PageMetadataOptions): Metadata {
  const formattedTitle = flow
    ? `${title} | ${flow} - ${SITE_CONFIG.name}`
    : `${title} | ${SITE_CONFIG.name}`;

  return {
    metadataBase: new URL(SITE_CONFIG.siteUrl || 'http://localhost:3000'),
    title: formattedTitle,
    description,
    keywords,
    applicationName: SITE_CONFIG.name,
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
    openGraph: {
      title: formattedTitle,
      description,
      siteName: SITE_CONFIG.name,
      type: 'website',
      images: [
        {
          url: image,
          alt: formattedTitle,
        },
      ],
      ...(canonicalUrl && { url: canonicalUrl }),
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: [image],
    },
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
  };
}

export default constructMetadata;
