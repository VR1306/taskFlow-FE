import { constructMetadata, SITE_CONFIG } from '@/lib/metadata';

describe('constructMetadata Utility', () => {
  it('constructs title with flow and app name', () => {
    const meta = constructMetadata({
      title: 'Sign In',
      flow: 'Auth',
    });

    expect(meta.title).toBe('Sign In | Auth - TaskFlow');
    expect(meta.applicationName).toBe(SITE_CONFIG.name);
  });

  it('constructs title without flow when omitted', () => {
    const meta = constructMetadata({
      title: 'Dashboard',
    });

    expect(meta.title).toBe('Dashboard | TaskFlow');
  });

  it('handles noIndex configuration properly', () => {
    const indexed = constructMetadata({ title: 'Home', noIndex: false });
    expect(indexed.robots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });

    const noIndexed = constructMetadata({ title: 'Secret', noIndex: true });
    expect(noIndexed.robots).toEqual({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });

  it('configures default favicon and apple icons', () => {
    const meta = constructMetadata({ title: 'Tasks' });
    expect(meta.icons).toEqual({
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    });
  });
});
