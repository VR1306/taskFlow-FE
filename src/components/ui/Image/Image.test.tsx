import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Image } from '@/components/ui/Image';

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
