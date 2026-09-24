import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from './ConfirmationModal';

it('supports a non-destructive confirmation with a custom icon', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  render(
    <ConfirmationModal
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      title="Publish project"
      message="Make this project available?"
      isDestructive={false}
      iconSrc="/icons/check.svg"
    />
  );
  expect(screen.getByRole('dialog', { name: 'Publish project' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('prevents duplicate confirmations while the action is pending', () => {
  render(
    <ConfirmationModal
      isOpen
      isLoading
      isDestructive={false}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
      title="Publish project"
      message="Publishing"
    />
  );
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
});
