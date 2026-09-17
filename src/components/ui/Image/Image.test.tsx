import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Image } from '@/components/ui/Image';

jest.mock('next/image', () => {
  return function MockNextImage({
    src,
    alt,
    onLoad,
    onError,
    className,
  }: {
    src: string;
    alt: string;
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    className?: string;
  }) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} className={className} onLoad={onLoad} onError={onError} />;
  };
});

describe('Image Component', () => {
  it('renders image with proper alt text, src, and dimensions', () => {
    render(
      <Image src="/authbackground.jpg" alt="Auth Kanban Illustration" width={400} height={300} />
    );

    const img = screen.getByAltText('Auth Kanban Illustration');
    expect(img).toBeInTheDocument();
  });

  it('switches to fallbackSrc on image load error and triggers onError callback', () => {
    const handleError = jest.fn();

    render(
      <Image
        src="/non-existent-image.jpg"
        alt="Missing Illustration"
        fallbackSrc="/file.svg"
        width={200}
        height={200}
        onError={handleError}
      />
    );

    const img = screen.getByAltText('Missing Illustration');

    fireEvent.error(img);

    expect(img).toHaveAttribute('src', expect.stringContaining('file.svg'));
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('triggers onLoad callback when image completes loading', () => {
    const handleLoad = jest.fn();

    render(
      <Image
        src="/authbackground.jpg"
        alt="Loaded Image"
        width={200}
        height={200}
        onLoad={handleLoad}
      />
    );

    const img = screen.getByAltText('Loaded Image');
    fireEvent.load(img);

    expect(handleLoad).toHaveBeenCalledTimes(1);
    expect(img).toHaveClass('opacity-100');
  });

  it('resets error and loaded states when src prop changes', () => {
    const { rerender } = render(
      <Image
        src="/first-image.jpg"
        alt="Dynamic Image"
        fallbackSrc="/file.svg"
        width={200}
        height={200}
      />
    );

    const img = screen.getByAltText('Dynamic Image');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', expect.stringContaining('file.svg'));

    rerender(
      <Image
        src="/second-image.jpg"
        alt="Dynamic Image"
        fallbackSrc="/file.svg"
        width={200}
        height={200}
      />
    );

    expect(img).toHaveAttribute('src', expect.stringContaining('second-image.jpg'));
  });

  it('renders div container when as="div" or fill is specified', () => {
    render(
      <Image
        src="/authbackground.jpg"
        alt="Fill Image"
        fill
        as="div"
        containerClassName="fill-container"
      />
    );

    const img = screen.getByAltText('Fill Image');
    expect(img.parentElement?.tagName).toBe('DIV');
    expect(img.parentElement).toHaveClass('fill-container');
  });

  it('applies custom container and image classes', () => {
    render(
      <Image
        src="/authbackground.jpg"
        alt="Styled Image"
        width={100}
        height={100}
        containerClassName="custom-container"
        className="custom-img"
      />
    );

    const img = screen.getByAltText('Styled Image');
    expect(img).toHaveClass('custom-img');
    expect(img.parentElement).toHaveClass('custom-container');
  });
});
