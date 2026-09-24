/** @jest-environment node */
import { triggerDownload } from './exportUtils';

it('skips downloads during server rendering', () => {
  expect(() => triggerDownload(new Blob(['report']), 'report.csv')).not.toThrow();
});

it('skips downloads when a window exists without a document', () => {
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
  try {
    expect(() => triggerDownload(new Blob(['report']), 'report.csv')).not.toThrow();
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
  }
});
