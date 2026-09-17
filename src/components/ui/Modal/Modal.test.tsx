import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

describe('Modal & ConfirmationModal Components', () => {
  describe('Modal Component', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders title, description, content and handles close button', () => {
      const handleClose = jest.fn();
      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Test Title"
          description="Test Description"
        >
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on backdrop click', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Body</div>
        </Modal>
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Body</div>
        </Modal>
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmationModal Component', () => {
    it('renders confirmation dialog with cancel and confirm actions', () => {
      const handleClose = jest.fn();
      const handleConfirm = jest.fn();

      render(
        <ConfirmationModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Confirm Action"
          message="Are you sure?"
          confirmText="Yes, Proceed"
          cancelText="No, Go Back"
          isDestructive={true}
        />
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /no, go back/i });
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      const confirmBtn = screen.getByRole('button', { name: /yes, proceed/i });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
