import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './loading';

describe('Root Loading Page', () => {
  it('renders full screen TaskFlow loader', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading TaskFlow...')).toBeInTheDocument();
  });
});
