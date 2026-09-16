import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader Component', () => {
  it('renders default loader with proper role and accessibility attributes', () => {
    render(<Loader />);

    const loaderStatus = screen.getByRole('status');
    expect(loaderStatus).toBeInTheDocument();
    expect(loaderStatus).toHaveAttribute('aria-live', 'polite');

    const svg = screen.getByRole('img', { name: /loading/i });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('renders with custom size dimensions', () => {
    render(<Loader size="lg" ariaLabel="Large Loading Indicator" />);

    const svg = screen.getByRole('img', { name: /large loading indicator/i });
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('renders custom loading text message', () => {
    render(<Loader text="Preparing your dashboard..." />);

    expect(screen.getByText('Preparing your dashboard...')).toBeInTheDocument();
  });

  it('renders in fullScreen mode with overlay container', () => {
    render(<Loader fullScreen text="Loading TaskFlow..." />);

    const overlay = screen.getByRole('status');
    expect(overlay).toHaveClass('fixed', 'inset-0');
    expect(screen.getByText('Loading TaskFlow...')).toBeInTheDocument();
  });

  it('renders different color variants (white, monochrome, gradient)', () => {
    const { rerender } = render(<Loader variant="white" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Loader variant="monochrome" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Loader variant="gradient" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Loader className="my-custom-loader" />);

    expect(screen.getByRole('status')).toHaveClass('my-custom-loader');
  });
});
