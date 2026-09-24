import { renderHook } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useMounted } from './useMounted';

describe('useMounted hook', () => {
  it('returns true after mounting on the client', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });

  it('uses the false server snapshot when rendered on the server', () => {
    const ServerComponent = () => {
      const mounted = useMounted();
      return React.createElement('div', null, mounted ? 'mounted' : 'not-mounted');
    };
    const html = renderToString(React.createElement(ServerComponent));
    expect(html).toContain('not-mounted');
  });
});
