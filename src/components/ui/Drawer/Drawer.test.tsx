import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

// Mock Next.js Image component
jest.mock('@/components/ui/Image', () => ({
  Image: ({ src, alt }: { src: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || ''} data-testid="drawer-image" />
  ),
}));

describe('Drawer Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Drawer',
    description: 'Test drawer description text',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('renders correctly when open with title and description', () => {
    render(
      <Drawer {...defaultProps}>
        <div>Drawer Child Content</div>
      </Drawer>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByText('Test drawer description text')).toBeInTheDocument();
    expect(screen.getByText('Drawer Child Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Drawer {...defaultProps} isOpen={false}>
        <div>Hidden Content</div>
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the backdrop', () => {
    const onClose = jest.fn();
    render(
      <Drawer {...defaultProps} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    const backdrop = screen.getByTestId('drawer-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the close icon button', () => {
    const onClose = jest.fn();
    render(
      <Drawer {...defaultProps} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    const closeButton = screen.getByRole('button', { name: /^close drawer$/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape key', () => {
    const onClose = jest.fn();
    render(
      <Drawer {...defaultProps} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom footer when provided', () => {
    render(
      <Drawer
        {...defaultProps}
        footer={
          <div>
            <button type="button">Action Button</button>
          </div>
        }
      >
        <div>Content</div>
      </Drawer>
    );

    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  it('applies width classes correctly', () => {
    const { rerender } = render(
      <Drawer {...defaultProps} width="lg">
        <div>Content</div>
      </Drawer>
    );

    expect(screen.getByTestId('drawer-panel')).toHaveClass('max-w-lg');

    rerender(
      <Drawer {...defaultProps} width="sm">
        <div>Content</div>
      </Drawer>
    );
    expect(screen.getByTestId('drawer-panel')).toHaveClass('max-w-sm');
  });

  it('manages body overflow on open and cleanup', () => {
    const { unmount } = render(
      <Drawer {...defaultProps}>
        <div>Content</div>
      </Drawer>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
