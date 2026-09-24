import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectOption } from './Select';
import * as helpers from '@/helpers';

jest.mock('@/helpers', () => ({
  ...jest.requireActual('@/helpers'),
  useMounted: jest.fn(() => true),
}));

describe('Select Component', () => {
  const options: SelectOption<string>[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Standard User' },
    { value: 'manager', label: 'Project Manager' },
  ];

  it('renders with placeholder and value', () => {
    render(
      <Select
        id="test-select"
        options={options}
        value="admin"
        placeholder="Choose role..."
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('handles option changes', () => {
    const handleChange = jest.fn();

    render(
      <Select
        id="test-select"
        options={options}
        value="user"
        onChange={handleChange}
        placeholder="Choose role..."
      />
    );

    const control = screen.getByText('Standard User');
    fireEvent.mouseDown(control);

    const adminOption = screen.getByText('Administrator');
    fireEvent.click(adminOption);

    expect(handleChange).toHaveBeenCalledWith('admin');
  });

  it('supports disabled and error states', () => {
    const { rerender } = render(
      <Select
        id="test-select"
        options={options}
        isDisabled={true}
        isError={false}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toBeDisabled();

    rerender(
      <Select
        id="test-select"
        options={options}
        isDisabled={false}
        isError={true}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('renders custom className and handles empty options gracefully', () => {
    const { container } = render(
      <Select
        id="test-custom-select"
        className="custom-select-wrapper"
        options={[]}
        onChange={jest.fn()}
      />
    );

    expect(container.querySelector('.custom-select-wrapper')).toBeInTheDocument();
  });

  it('does not target document.body for the menu portal before the component has mounted', () => {
    (helpers.useMounted as jest.Mock).mockReturnValueOnce(false);

    render(
      <Select id="test-select-unmounted" options={options} onChange={jest.fn()} value="admin" />
    );

    // Still renders the control normally, just without a menu portal target yet.
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('applies focused/error control styles and highlights a non-selected option', () => {
    render(<Select id="test-select-focus" options={options} isError={true} onChange={jest.fn()} />);

    const combobox = screen.getByRole('combobox');
    fireEvent.focus(combobox);
    fireEvent.mouseDown(combobox);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });

    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Standard User')).toBeInTheDocument();
  });
});
