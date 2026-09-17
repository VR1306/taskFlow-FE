import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar Component', () => {
  it('renders initials from first and last names', () => {
    render(<Avatar firstName="John" lastName="Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial when lastName is omitted', () => {
    render(<Avatar firstName="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders fallback initial when name is missing', () => {
    render(<Avatar />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders img element when src is provided', () => {
    render(<Avatar src="/profile.jpg" alt="Profile Picture" />);
    const img = screen.getByAltText('Profile Picture');
    expect(img).toBeInTheDocument();
    expect(decodeURIComponent(img.getAttribute('src') || '')).toContain('/profile.jpg');
  });

  it('renders different sizes and color schemes', () => {
    const { rerender } = render(<Avatar firstName="Bob" size="lg" colorScheme="purple" />);
    let avatar = screen.getByText('B');
    expect(avatar).toHaveClass('h-12');
    expect(avatar).toHaveClass('bg-purple-100');

    rerender(<Avatar firstName="Bob" size="xs" colorScheme="emerald" />);
    avatar = screen.getByText('B');
    expect(avatar).toHaveClass('h-6');
    expect(avatar).toHaveClass('bg-emerald-100');
  });
});
