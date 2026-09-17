'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/validations/auth';
import { Input, Button, Image } from '@/components/ui';
import { FORGOT_PASSWORD_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';

export interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => Promise<void> | void;
  className?: string;
}

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const ForgotPasswordForm: React.FC<Readonly<ForgotPasswordFormProps>> = ({
  onSubmit,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setValue,
    formState: { isValid },
  } = methods;

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      setResendSuccess(false);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await authService.forgotPassword({
          email: data.email,
        });
      }

      setSubmittedEmail(data.email.trim());
      setIsSuccess(true);
      setCountdown(FORGOT_PASSWORD_CONSTANTS.resendCooldownSeconds);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : FORGOT_PASSWORD_CONSTANTS.errors.defaultSubmitError;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail || isResending || countdown > 0) return;
    try {
      setIsResending(true);
      setServerError(null);
      setResendSuccess(false);

      await authService.forgotPassword({
        email: submittedEmail,
      });

      setResendSuccess(true);
      setCountdown(FORGOT_PASSWORD_CONSTANTS.resendCooldownSeconds);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : FORGOT_PASSWORD_CONSTANTS.errors.defaultResendError;
      setServerError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleTryDifferentEmail = () => {
    setIsSuccess(false);
    setServerError(null);
    setResendSuccess(false);
    setValue('email', submittedEmail, { shouldValidate: true });
  };

  const getResendButtonLabel = (): string => {
    if (isResending) {
      return FORGOT_PASSWORD_CONSTANTS.resendingButtonText;
    }
    if (countdown > 0) {
      return `${FORGOT_PASSWORD_CONSTANTS.resendButtonText} (${formatCountdown(countdown)})`;
    }
    return FORGOT_PASSWORD_CONSTANTS.resendButtonText;
  };

  return (
    <div className={`w-full flex flex-col justify-center animate-fadeIn ${className}`}>
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-start">
        {/* Brand Icon & Logo */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm p-1.5">
            <Image
              src="/icons/logo.svg"
              alt={FORGOT_PASSWORD_CONSTANTS.brandLogoAlt}
              width={24}
              height={24}
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {FORGOT_PASSWORD_CONSTANTS.brandName}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {isSuccess ? FORGOT_PASSWORD_CONSTANTS.successTitle : FORGOT_PASSWORD_CONSTANTS.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-500">
          {isSuccess ? (
            <>
              {FORGOT_PASSWORD_CONSTANTS.successSubtitle}{' '}
              <span className="font-semibold text-slate-800 break-all">{submittedEmail}</span>
            </>
          ) : (
            FORGOT_PASSWORD_CONSTANTS.subtitle
          )}
        </p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-medium text-rose-700 animate-fadeIn"
        >
          {serverError}
        </div>
      )}

      {/* Resend Success Notification */}
      {resendSuccess && (
        <output className="block mb-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs font-medium text-emerald-700 animate-fadeIn">
          {FORGOT_PASSWORD_CONSTANTS.resendSuccessMessage}
        </output>
      )}

      {!isSuccess ? (
        /* Forgot Password Form */
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Work Email Field */}
            <Input
              name="email"
              type="email"
              label={FORGOT_PASSWORD_CONSTANTS.emailLabel}
              placeholder={FORGOT_PASSWORD_CONSTANTS.emailPlaceholder}
              required
              autoComplete="email"
              icon={
                <Image
                  src="/icons/mail.svg"
                  alt={FORGOT_PASSWORD_CONSTANTS.emailIconAlt}
                  width={16}
                  height={16}
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
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                loadingText={FORGOT_PASSWORD_CONSTANTS.submittingButtonText}
                className="shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {FORGOT_PASSWORD_CONSTANTS.submitButtonText}
              </Button>
            </div>

            {/* Back to Sign In Action */}
            <div className="mt-4 text-center">
              <Link
                href={FORGOT_PASSWORD_CONSTANTS.loginHref}
                className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {FORGOT_PASSWORD_CONSTANTS.backToSignInText}
              </Link>
            </div>
          </form>
        </FormProvider>
      ) : (
        /* Success Confirmation View */
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>{FORGOT_PASSWORD_CONSTANTS.successInstruction}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Resend Link Button with 1m 30s Cooldown Timer */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              disabled={isResending || countdown > 0}
              isLoading={isResending}
              loadingText={FORGOT_PASSWORD_CONSTANTS.resendingButtonText}
              onClick={handleResend}
              className="font-semibold text-sm"
            >
              {getResendButtonLabel()}
            </Button>

            {/* Try with a Different Email Button */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleTryDifferentEmail}
              className="font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200/90 border border-slate-200"
            >
              {FORGOT_PASSWORD_CONSTANTS.tryDifferentEmailText}
            </Button>

            {/* Back to Sign In Action */}
            <div className="text-center pt-2">
              <Link
                href={FORGOT_PASSWORD_CONSTANTS.loginHref}
                className="inline-flex items-center justify-center py-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {FORGOT_PASSWORD_CONSTANTS.backToSignInText}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
