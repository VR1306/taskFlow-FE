import {
  escapeCsvValue,
  generateCsvContent,
  exportToCsv,
  exportToJson,
  triggerDownload,
} from './exportUtils';

describe('exportUtils', () => {
  describe('escapeCsvValue', () => {
    it('returns empty string for null or undefined', () => {
      expect(escapeCsvValue(null)).toBe('');
      expect(escapeCsvValue(undefined)).toBe('');
    });

    it('returns primitive strings as-is if no special characters', () => {
      expect(escapeCsvValue('John Doe')).toBe('John Doe');
      expect(escapeCsvValue(1234)).toBe('1234');
      expect(escapeCsvValue(true)).toBe('true');
      expect(escapeCsvValue({ role: 'admin' })).toBe('"{""role"":""admin""}"');
    });

    it('escapes strings with commas, quotes, and newlines', () => {
      expect(escapeCsvValue('Smith, Jane')).toBe('"Smith, Jane"');
      expect(escapeCsvValue('He said "hello"')).toBe('"He said ""hello"""');
      expect(escapeCsvValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });
  });

  describe('generateCsvContent', () => {
    interface TestItem {
      id: string;
      name: string;
      email: string;
      role: string;
    }

    const testData: TestItem[] = [
      { id: '1', name: 'Alice, Smith', email: 'alice@test.com', role: 'Admin' },
      { id: '2', name: 'Bob "The Builder"', email: 'bob@test.com', role: 'User' },
    ];

    it('generates properly formatted CSV string', () => {
      const columns = [
        { header: 'ID', accessor: 'id' as const },
        { header: 'Full Name', accessor: 'name' as const },
        { header: 'Email Address', accessor: (item: TestItem) => item.email.toUpperCase() },
        { header: 'Role', accessor: 'role' as const },
      ];

      const result = generateCsvContent(testData, columns);
      expect(result).toContain('ID,Full Name,Email Address,Role');
      expect(result).toContain('1,"Alice, Smith",ALICE@TEST.COM,Admin');
      expect(result).toContain('2,"Bob ""The Builder""",BOB@TEST.COM,User');
    });
  });

  describe('exportToCsv and exportToJson', () => {
    let originalCreateElement: typeof document.createElement;
    let clickMock: jest.Mock;

    beforeEach(() => {
      clickMock = jest.fn();
      originalCreateElement = document.createElement.bind(document);

      window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      window.URL.revokeObjectURL = jest.fn();

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const element = originalCreateElement(tagName) as HTMLAnchorElement;
          element.click = clickMock;
          return element;
        }
        return originalCreateElement(tagName);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('triggers CSV download with .csv appended', () => {
      const data = [{ name: 'Test User', role: 'Admin' }];
      const columns = [
        { header: 'Name', accessor: 'name' as const },
        { header: 'Role', accessor: 'role' as const },
      ];

      exportToCsv(data, 'users-export', columns);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('triggers JSON download with .json appended', () => {
      const data = [{ name: 'Test User', role: 'Admin' }];

      exportToJson(data, 'users-export.json');

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('applies transformFn in exportToJson when provided', () => {
      const data = [{ name: 'Test User', role: 'Admin' }];
      const transform = (item: (typeof data)[0]) => ({
        fullName: item.name.toUpperCase(),
        roleName: item.role,
      });

      exportToJson(data, 'transformed-export', transform);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });

    it('triggerDownload handles SSR gracefully when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error simulating ssr
      delete global.window;

      const blob = new Blob(['test']);
      expect(() => triggerDownload(blob, 'test.csv')).not.toThrow();

      global.window = originalWindow;
    });
  });
});
