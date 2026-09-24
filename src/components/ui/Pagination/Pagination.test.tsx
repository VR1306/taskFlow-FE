import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    limit: 10,
    onPageChange: jest.fn(),
    onLimitChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders record range summary and page buttons', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText(/of/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
  });

  it('does not render when totalItems is 0', () => {
    const { container } = render(<Pagination {...defaultProps} totalItems={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles page number click', () => {
    render(<Pagination {...defaultProps} />);

    const page2Button = screen.getByRole('button', { name: 'Page 2' });
    fireEvent.click(page2Button);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles Previous and Next button clicks', () => {
    const { rerender } = render(<Pagination {...defaultProps} currentPage={2} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);

    // Disable Next button on last page
    rerender(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('renders ellipsis when totalPages is large', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} totalItems={100} />);

    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
  });

  it('handles page size limit selection', () => {
    render(<Pagination {...defaultProps} />);

    const select = screen.getByLabelText(/per page/i);
    fireEvent.change(select, { target: { value: '20' } });

    expect(defaultProps.onLimitChange).toHaveBeenCalledWith(20);
  });

  it('leaves a singular itemLabel unchanged when it does not end with "s"', () => {
    const { container } = render(
      <Pagination
        {...defaultProps}
        totalItems={1}
        totalPages={1}
        currentPage={1}
        itemLabel="data"
      />
    );

    expect(container.textContent).toContain('data');
  });
});
