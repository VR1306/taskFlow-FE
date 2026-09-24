import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from './ExportButton';

describe('ExportButton', () => {
  const mockExportCsv = jest.fn();
  const mockExportJson = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default label', () => {
    render(<ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />);
    expect(screen.getByRole('button', { name: /export options/i })).toBeInTheDocument();
  });

  it('opens and closes dropdown menu on button click', () => {
    render(<ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />);
    const trigger = screen.getByRole('button', { name: /export options/i });

    // Click to open
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Export as CSV (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON (.json)')).toBeInTheDocument();

    // Click to close
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onExportCsv when CSV option is clicked', () => {
    render(<ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />);
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));

    const csvButton = screen.getByText('Export as CSV (.csv)');
    fireEvent.click(csvButton);

    expect(mockExportCsv).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onExportJson when JSON option is clicked', () => {
    render(<ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />);
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));

    const jsonButton = screen.getByText('Export as JSON (.json)');
    fireEvent.click(jsonButton);

    expect(mockExportJson).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu when Escape key is pressed', () => {
    render(<ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />);
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu on outside click', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} disabled={true} />
    );
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open when isLoading is true', () => {
    render(
      <ExportButton onExportCsv={mockExportCsv} onExportJson={mockExportJson} isLoading={true} />
    );
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
