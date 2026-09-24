'use client';

import React, { memo } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  iconSrc?: string;
  confirmIcon?: React.ReactNode;
}

export const ConfirmationModal = memo(function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  iconSrc,
  confirmIcon,
}: Readonly<ConfirmationModalProps>) {
  const defaultIcon = isDestructive ? '/icons/trash.svg' : '/icons/info-modal.svg';
  const resolvedIcon = iconSrc || defaultIcon;

  return (
    <Modal
      ariaLabel={title}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      showCloseButton={!isLoading}
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Modal Icon */}
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
            isDestructive
              ? 'bg-rose-50 border border-rose-100/80 shadow-xs'
              : 'bg-blue-50 border border-blue-100/80 shadow-xs'
          }`}
        >
          <Image src={resolvedIcon} alt="" width={30} height={30} loading="eager" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2.5">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">{message}</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full text-slate-700 font-semibold border-slate-300 hover:bg-slate-100/80 transition-colors"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            leftIcon={confirmIcon}
            className={`w-full font-semibold transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 shadow-sm shadow-red-500/25 border border-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm shadow-blue-500/25 border border-blue-600 text-white'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;
