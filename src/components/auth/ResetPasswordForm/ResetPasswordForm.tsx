'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/validations/auth';
import { Input, Button, Image } from '@/components/ui';
import { RESET_PASSWORD_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';

export interface ResetPasswordFormProps {
  token?: string;
  email?: string;
  onSubmit?: (data: ResetPasswordFormData) => Promise<void> | void;
  className?: string;
}

interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}

const PasswordToggle: React.FC<Readonly<PasswordToggleProps>> = ({
  isVisible,
  onToggle,
  showLabel,
  hideLabel,
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onToggle}
    className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors cursor-pointer"
    aria-label={isVisible ? hideLabel : showLabel}
  >
    <Image
      key={isVisible ? 'eye-off' : 'eye'}
      src={isVisible ? '/icons/eye-off.svg' : '/icons/eye.svg'}
      alt={isVisible ? hideLabel : showLabel}
      width={18}
      height={18}
    />
  </button>
);

interface ServerErrorAlertProps {
  message: string;
  isUnauthorized?: boolean;
}

const ServerErrorAlert: React.FC<Readonly<ServerErrorAlertProps>> = ({
  message,
  isUnauthorized,
}) => (
  <div
    role="alert"
    className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm font-medium text-rose-700 animate-fadeIn"
  >
    <p>{message}</p>
    {isUnauthorized && (
      <div className="mt-3 pt-2 border-t border-rose-200/60">
        <Link
          href={RESET_PASSWORD_CONSTANTS.requestResetHref}
          className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {RESET_PASSWORD_CONSTANTS.requestNewLinkText} &rarr;
        </Link>
      </div>
    )}
  </div>
);

const SuccessView: React.FC = () => (
  <div className="flex flex-col gap-5 animate-fadeIn">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm text-emerald-800 leading-relaxed">
      <p>{RESET_PASSWORD_CONSTANTS.successSubtitle}</p>
    </div>

    <div className="pt-2">
      <Link
        href={RESET_PASSWORD_CONSTANTS.loginHref}
        className="w-full flex items-center justify-center h-12 px-6 text-base font-semibold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all text-center"
      >
        {RESET_PASSWORD_CONSTANTS.goToSignInButtonText}
      </Link>
    </div>
  </div>
);

const extractErrorDetails = (err: unknown): { message: string; isUnauthorized: boolean } => {
  if (err instanceof ApiError) {
    return {
      message: err.message,
      isUnauthorized: err.status === 401,
    };
  }
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { message?: string; status?: number; statusCode?: number };
    const status = errorObj.status ?? errorObj.statusCode;
    return {
      message: errorObj.message ?? RESET_PASSWORD_CONSTANTS.errors.defaultSubmitError,
      isUnauthorized: status === 401,
    };
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      isUnauthorized: false,
    };
  }
  return {
    message: RESET_PASSWORD_CONSTANTS.errors.defaultSubmitError,
    isUnauthorized: false,
  };
};

export const ResetPasswordForm: React.FC<Readonly<ResetPasswordFormProps>> = ({
  token: propToken,
  email: propEmail,
  onSubmit,
  className = '',
}) => {
  const searchParams = useSearchParams();
  const token = propToken !== undefined ? propToken : searchParams.get('token') || '';
  const email = propEmail !== undefined ? propEmail : searchParams.get('email') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError(RESET_PASSWORD_CONSTANTS.errors.tokenMissing);
      setIsUnauthorized(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);
      setIsUnauthorized(false);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await authService.resetPassword({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorDetails = extractErrorDetails(err);
      setServerError(errorDetails.message);
      setIsUnauthorized(errorDetails.isUnauthorized);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubtitle = () => {
    if (isSuccess) {
      return RESET_PASSWORD_CONSTANTS.successSubtitle;
    }
    if (email) {
      return (
        <>
          {RESET_PASSWORD_CONSTANTS.subtitlePrefix}{' '}
          <span className="font-semibold text-slate-800 break-all">{email}</span>
        </>
      );
    }
    return RESET_PASSWORD_CONSTANTS.defaultSubtitle;
  };

  return (
    <div className={`w-full flex flex-col justify-center animate-fadeIn ${className}`}>
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-start">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm p-1.5">
            <Image
              src="/icons/logo.svg"
              alt={RESET_PASSWORD_CONSTANTS.brandLogoAlt}
              width={24}
              height={24}
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {RESET_PASSWORD_CONSTANTS.brandName}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {isSuccess ? RESET_PASSWORD_CONSTANTS.successTitle : RESET_PASSWORD_CONSTANTS.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-500">{getSubtitle()}</p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && <ServerErrorAlert message={serverError} isUnauthorized={isUnauthorized} />}

      {!isSuccess ? (
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* New Password Field */}
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={RESET_PASSWORD_CONSTANTS.passwordLabel}
              placeholder={RESET_PASSWORD_CONSTANTS.passwordPlaceholder}
              required
              autoComplete="new-password"
              icon={
                <Image
                  src="/icons/lock.svg"
                  alt={RESET_PASSWORD_CONSTANTS.passwordIconAlt}
                  width={16}
                  height={16}
                />
              }
              trailingAction={
                <PasswordToggle
                  isVisible={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                  showLabel={RESET_PASSWORD_CONSTANTS.showPasswordText}
                  hideLabel={RESET_PASSWORD_CONSTANTS.hidePasswordText}
                />
              }
            />

            {/* Confirm New Password Field */}
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label={RESET_PASSWORD_CONSTANTS.confirmPasswordLabel}
              placeholder={RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder}
              required
              autoComplete="new-password"
              icon={
                <Image
                  src="/icons/lock.svg"
                  alt={RESET_PASSWORD_CONSTANTS.passwordIconAlt}
                  width={16}
                  height={16}
                />
              }
              trailingAction={
                <PasswordToggle
                  isVisible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  showLabel={RESET_PASSWORD_CONSTANTS.showConfirmPasswordText}
                  hideLabel={RESET_PASSWORD_CONSTANTS.hideConfirmPasswordText}
                />
              }
            />

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isValid || isSubmitting || !token}
                isLoading={isSubmitting}
                loadingText={RESET_PASSWORD_CONSTANTS.submittingButtonText}
                className="shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {RESET_PASSWORD_CONSTANTS.submitButtonText}
              </Button>
            </div>

            {/* Back to Sign In Action */}
            <div className="mt-4 text-center">
              <Link
                href={RESET_PASSWORD_CONSTANTS.loginHref}
                className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {RESET_PASSWORD_CONSTANTS.backToSignInText}
              </Link>
            </div>
          </form>
        </FormProvider>
      ) : (
        <SuccessView />
      )}
    </div>
  );
};

export default ResetPasswordForm;
