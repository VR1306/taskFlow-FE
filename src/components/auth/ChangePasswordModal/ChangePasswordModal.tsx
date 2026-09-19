'use client';

import React, { useState, useCallback, memo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@/validations/auth';
import { Modal, Input, Button, Image } from '@/components/ui';
import { CHANGE_PASSWORD_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';
import { PasswordToggle } from '@/components/auth/PasswordToggle';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const extractErrorDetails = (err: unknown): string => {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { message?: string; error?: string };
    return (
      errorObj.message || errorObj.error || CHANGE_PASSWORD_CONSTANTS.errors.defaultSubmitError
    );
  }
  if (err instanceof Error) {
    return err.message;
  }
  return CHANGE_PASSWORD_CONSTANTS.errors.defaultSubmitError;
};

interface ChangePasswordFormContentProps {
  onClose: () => void;
  onSuccess?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const ChangePasswordFormContent: React.FC<Readonly<ChangePasswordFormContentProps>> = ({
  onClose,
  onSuccess,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleToggleCurrentPassword = useCallback(() => {
    setShowCurrentPassword((prev) => !prev);
  }, []);

  const handleToggleNewPassword = useCallback(() => {
    setShowNewPassword((prev) => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    async (data: ChangePasswordFormData) => {
      setServerError(null);

      try {
        const response = await authService.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });

        setIsSuccess(true);
        setSuccessMessage(response.message || CHANGE_PASSWORD_CONSTANTS.successTitle);
        onSuccess?.();
      } catch (err: unknown) {
        setServerError(extractErrorDetails(err));
      }
    },
    [onSuccess]
  );

  return (
    <div className="flex flex-col p-1 sm:p-2">
      {/* Header with Icon */}
      <div className="flex items-center gap-3.5 mb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 shadow-2xs">
          <Image src="/icons/lock.svg" alt="Change Password" width={22} height={22} />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {CHANGE_PASSWORD_CONSTANTS.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {CHANGE_PASSWORD_CONSTANTS.description}
          </p>
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs sm:text-sm font-medium text-rose-700 flex items-start gap-2.5 animate-in fade-in"
        >
          <div className="shrink-0 mt-0.5">
            <Image src="/icons/alert-circle.svg" alt="" width={16} height={16} />
          </div>
          <div className="flex-1">{serverError}</div>
        </div>
      )}

      {/* Success View or Form */}
      {isSuccess ? (
        <div className="flex flex-col gap-5 py-2 animate-in fade-in">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Image src="/icons/check.svg" alt="Success" width={16} height={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">
                {successMessage || CHANGE_PASSWORD_CONSTANTS.successTitle}
              </p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                {CHANGE_PASSWORD_CONSTANTS.successSubtitle}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="w-full sm:w-auto px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {CHANGE_PASSWORD_CONSTANTS.closeButtonText}
            </Button>
          </div>
        </div>
      ) : (
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
            data-testid="change-password-form"
          >
            {/* Current Password Field */}
            <Input
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              label={CHANGE_PASSWORD_CONSTANTS.currentPasswordLabel}
              placeholder={CHANGE_PASSWORD_CONSTANTS.currentPasswordPlaceholder}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
              trailingAction={
                <PasswordToggle
                  isVisible={showCurrentPassword}
                  onToggle={handleToggleCurrentPassword}
                  showLabel={CHANGE_PASSWORD_CONSTANTS.showCurrentPasswordText}
                  hideLabel={CHANGE_PASSWORD_CONSTANTS.hideCurrentPasswordText}
                />
              }
            />

            {/* New Password Field */}
            <Input
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              label={CHANGE_PASSWORD_CONSTANTS.newPasswordLabel}
              placeholder={CHANGE_PASSWORD_CONSTANTS.newPasswordPlaceholder}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              trailingAction={
                <PasswordToggle
                  isVisible={showNewPassword}
                  onToggle={handleToggleNewPassword}
                  showLabel={CHANGE_PASSWORD_CONSTANTS.showNewPasswordText}
                  hideLabel={CHANGE_PASSWORD_CONSTANTS.hideNewPasswordText}
                />
              }
            />

            {/* Confirm New Password Field */}
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label={CHANGE_PASSWORD_CONSTANTS.confirmPasswordLabel}
              placeholder={CHANGE_PASSWORD_CONSTANTS.confirmPasswordPlaceholder}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              trailingAction={
                <PasswordToggle
                  isVisible={showConfirmPassword}
                  onToggle={handleToggleConfirmPassword}
                  showLabel={CHANGE_PASSWORD_CONSTANTS.showConfirmPasswordText}
                  hideLabel={CHANGE_PASSWORD_CONSTANTS.hideConfirmPasswordText}
                />
              }
            />

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                {CHANGE_PASSWORD_CONSTANTS.cancelButtonText}
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25"
              >
                {isSubmitting
                  ? CHANGE_PASSWORD_CONSTANTS.submittingButtonText
                  : CHANGE_PASSWORD_CONSTANTS.submitButtonText}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export const ChangePasswordModal = memo(function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={true}>
      <ChangePasswordFormContent onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
});

ChangePasswordModal.displayName = 'ChangePasswordModal';

export default ChangePasswordModal;
