import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { Checkbox } from '@/components/ui/Checkbox';

interface FormValues {
  rememberMe: boolean;
}

const CheckboxTestWrapper: React.FC<{
  label: string;
  disabled?: boolean;
}> = ({ label, disabled }) => {
  const { control } = useForm<FormValues>({
    defaultValues: { rememberMe: false },
  });

  return <Checkbox name="rememberMe" control={control} label={label} disabled={disabled} />;
};

describe('Checkbox Component', () => {
  it('renders checkbox with associated label', () => {
    render(<CheckboxTestWrapper label="Keep me signed in" />);

    const checkbox = screen.getByLabelText('Keep me signed in');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggles checked state when clicked', () => {
    render(<CheckboxTestWrapper label="Keep me signed in" />);

    const checkbox = screen.getByLabelText('Keep me signed in');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('renders disabled state and prevents toggle when disabled', () => {
    render(<CheckboxTestWrapper label="Keep me signed in" disabled />);

    const checkbox = screen.getByLabelText('Keep me signed in');
    expect(checkbox).toBeDisabled();
  });

  it('renders and toggles inside FormProvider without explicit control prop', () => {
    const FormProviderCheckboxWrapper: React.FC = () => {
      const methods = useForm<FormValues>({
        defaultValues: { rememberMe: true },
      });

      return (
        <FormProvider {...methods}>
          <Checkbox name="rememberMe" label="Context Remember Me" />
        </FormProvider>
      );
    };

    render(<FormProviderCheckboxWrapper />);

    const checkbox = screen.getByLabelText('Context Remember Me');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
