'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/validations/auth';
import { Input, Button, Checkbox, Image } from '@/components/ui';
import { LOGIN_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';
import { authStorage, resolvePostLoginRedirect, resolveLandingPageForUser } from '@/helpers';
import { useAppDispatch, setCredentials } from '@/store';

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void> | void;
  className?: string;
}

export const LoginForm: React.FC<Readonly<LoginFormProps>> = ({ onSubmit, className = '' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setValue,
    formState: { isValid },
  } = methods;

  React.useEffect(() => {
    const rememberedEmail = authStorage.getRememberedEmail();
    const rememberMe = authStorage.getRememberMe();
    if (rememberedEmail) {
      setValue('email', rememberedEmail, { shouldValidate: true });
      setValue('rememberMe', rememberMe, { shouldValidate: true });
    }
  }, [setValue]);

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        const response = await authService.signIn({
          email: data.email,
          password: data.password,
          rememberMe: Boolean(data.rememberMe),
        });

        // The user's permissions (from the login response) decide which modules they can
        // see at all — landingPage is the first one, used both to store a "default module"
        // for later (e.g. bouncing an already-authenticated visitor off the login page) and,
        // unless an explicit deep link brought them here, as where they land right now.
        const landingPage = resolveLandingPageForUser(response.user);

        const activeToken = response.accessToken || response.token;
        authStorage.setAuthSession(
          activeToken,
          response.user,
          Boolean(data.rememberMe),
          response.refreshToken,
          landingPage.replace(/^\//, '')
        );
        // Hydrate Redux immediately — the app never remounts StoreProvider's
        // one-time storage-hydration effect on this client-side navigation, so
        // without this, state.auth.user (and anything gated on it, like the
        // notifications bell) would stay stale until a full page reload.
        dispatch(setCredentials({ user: response.user, rememberMe: Boolean(data.rememberMe) }));

        const destination = resolvePostLoginRedirect({
          redirectParam: searchParams?.get('redirect'),
          user: response.user,
        });

        router.replace(destination);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : LOGIN_CONSTANTS.errors.defaultSubmitError;
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
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
              alt={LOGIN_CONSTANTS.brandLogoAlt}
              width={24}
              height={24}
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {LOGIN_CONSTANTS.brandName}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {LOGIN_CONSTANTS.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-500">{LOGIN_CONSTANTS.subtitle}</p>
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

      {/* Login Form wrapped with FormProvider */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">
          {/* Work Email Field */}
          <Input
            name="email"
            type="email"
            label={LOGIN_CONSTANTS.emailLabel}
            placeholder={LOGIN_CONSTANTS.emailPlaceholder}
            required
            autoComplete="email"
            icon={
              <Image
                src="/icons/mail.svg"
                alt={LOGIN_CONSTANTS.emailIconAlt}
                width={16}
                height={16}
              />
            }
          />

          {/* Password Field */}
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={LOGIN_CONSTANTS.passwordLabel}
            placeholder={LOGIN_CONSTANTS.passwordPlaceholder}
            required
            autoComplete="current-password"
            rightAction={
              <Link
                href={LOGIN_CONSTANTS.forgotPasswordHref}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {LOGIN_CONSTANTS.forgotPasswordText}
              </Link>
            }
            icon={
              <Image
                src="/icons/lock.svg"
                alt={LOGIN_CONSTANTS.passwordIconAlt}
                width={16}
                height={16}
              />
            }

            trailingAction={
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors cursor-pointer"
                aria-label={
                  showPassword ? LOGIN_CONSTANTS.hidePasswordText : LOGIN_CONSTANTS.showPasswordText
                }
              >
                <Image
                  key={showPassword ? 'eye-off' : 'eye'}
                  src={showPassword ? '/icons/eye-off.svg' : '/icons/eye.svg'}
                  alt={
                    showPassword
                      ? LOGIN_CONSTANTS.hidePasswordText
                      : LOGIN_CONSTANTS.showPasswordText
                  }
                  width={18}
                  height={18}
                />
              </button>
            }
          />

          {/* Keep Me Signed In Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <Checkbox name="rememberMe" label={LOGIN_CONSTANTS.keepSignedInLabel} />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              loadingText={LOGIN_CONSTANTS.submittingButtonText}
              className="shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LOGIN_CONSTANTS.submitButtonText}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Footer Invitation Prompt */}
      <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
        <span>{LOGIN_CONSTANTS.footerPrompt} </span>
        <a
          href={LOGIN_CONSTANTS.inviteHref}
          className="font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
        >
          {LOGIN_CONSTANTS.footerActionText}
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
