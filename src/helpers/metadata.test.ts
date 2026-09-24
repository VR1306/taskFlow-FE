import { constructMetadata, SITE_CONFIG } from './metadata';

describe('constructMetadata Helper', () => {
  it('constructs basic metadata without flow correctly', () => {
    const meta = constructMetadata({
      title: 'Sign In',
      description: 'Sign in to your account',
    });

    expect(meta.title).toBe(`Sign In | ${SITE_CONFIG.name}`);
    expect(meta.description).toBe('Sign in to your account');
    expect(meta.applicationName).toBe(SITE_CONFIG.name);
  });

  it('constructs formatted title when flow is supplied', () => {
    const meta = constructMetadata({
      title: 'Reset Password',
      flow: 'Auth',
    });

    expect(meta.title).toBe(`Reset Password | Auth - ${SITE_CONFIG.name}`);
  });

  it('applies noIndex robots directives when noIndex is true', () => {
    const meta = constructMetadata({
      title: 'Private Area',
      noIndex: true,
    });

    expect(meta.robots).toEqual({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
  });

  it('allows indexing when noIndex is false or omitted', () => {
    const meta = constructMetadata({
      title: 'Public Page',
    });

    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    });
  });
});

it('publishes a canonical URL and custom social image', () => {
  const metadata = constructMetadata({
    title: 'Projects',
    canonicalUrl: 'https://example.com/projects',
    image: '/projects.png',
    keywords: ['projects'],
  });
  expect(metadata.alternates).toEqual({ canonical: 'https://example.com/projects' });
  expect(metadata.openGraph).toMatchObject({
    url: 'https://example.com/projects',
    images: [{ url: '/projects.png' }],
  });
  expect(metadata.keywords).toEqual(['projects']);
});

it('uses the local metadata base when the site URL is empty', () => {
  const originalUrl = SITE_CONFIG.siteUrl;
  SITE_CONFIG.siteUrl = '';
  try {
    expect(constructMetadata({ title: 'Preview' }).metadataBase?.toString()).toBe(
      'http://localhost:3000/'
    );
  } finally {
    SITE_CONFIG.siteUrl = originalUrl;
  }
});
