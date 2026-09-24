import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormValues {
  email: string;
}

const TestWrapper: React.FC<{
  label?: string;
  required?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  trailingAction?: React.ReactNode;
}> = ({ label, required, errorMessage, icon, rightAction, trailingAction }) => {
  const { control } = useForm<FormValues>({
    defaultValues: { email: '' },
  });

  return (
    <Input
      name="email"
      control={control}
      label={label}
      required={required}
      placeholder="you@company.com"
      errorMessage={errorMessage}
      icon={icon}
      rightAction={rightAction}
      trailingAction={trailingAction}
    />
  );
};

describe('Input Component', () => {
  it('renders input with label and placeholder', () => {
    render(<TestWrapper label="Work email" required />);

    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
  });

  it('updates value when typed into', () => {
    render(<TestWrapper label="Work email" />);

    const input = screen.getByPlaceholderText('you@company.com');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    expect(input).toHaveValue('user@example.com');
  });

  it('renders ErrorMessage component when errorMessage is provided', () => {
    render(<TestWrapper label="Work email" errorMessage="Please enter a valid email" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Please enter a valid email');

    const input = screen.getByPlaceholderText('you@company.com');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders leading icon, right action, and trailing action when provided', () => {
    render(
      <TestWrapper
        label="Password"
        icon={<span data-testid="leading-icon">🔒</span>}
        rightAction={<a href="/forgot">Forgot?</a>}
        trailingAction={
          <button type="button" data-testid="trailing-action">
            Show
          </button>
        }
      />
    );

    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    expect(screen.getByText('Forgot?')).toBeInTheDocument();
    expect(screen.getByTestId('trailing-action')).toBeInTheDocument();
  });

  it('does not render the label/right-action row when neither label nor rightAction is provided', () => {
    const { container } = render(<TestWrapper />);

    expect(container.querySelector('label')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
  });

  it('renders the right action row even when no label is provided', () => {
    const { container } = render(<TestWrapper rightAction={<a href="/forgot">Forgot?</a>} />);

    expect(screen.getByText('Forgot?')).toBeInTheDocument();
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders and works within FormProvider without explicit control prop', () => {
    const FormProviderWrapper: React.FC = () => {
      const methods = useForm<FormValues>({
        defaultValues: { email: 'initial@taskflow.com' },
      });

      return (
        <FormProvider {...methods}>
          <Input name="email" label="Context Email" placeholder="Context placeholder" />
        </FormProvider>
      );
    };

    render(<FormProviderWrapper />);

    const input = screen.getByLabelText(/context email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('initial@taskflow.com');

    fireEvent.change(input, { target: { value: 'updated@taskflow.com' } });
    expect(input).toHaveValue('updated@taskflow.com');
  });
});
