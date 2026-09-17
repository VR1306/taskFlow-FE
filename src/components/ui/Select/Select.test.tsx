import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectOption } from './Select';

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
});
