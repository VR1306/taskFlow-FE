'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Drawer, Button, Image, Select } from '@/components/ui';
import { useAppDispatch, createUserThunk } from '@/store';
import { USERS_CONSTANTS, CREATE_ROLE_OPTIONS, CreateUserRole } from '@/constants';

export interface CreateUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: CreateUserRole;
}

export const CreateUserDrawer = memo(function CreateUserDrawer({
  isOpen,
  onClose,
}: CreateUserDrawerProps) {
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CreateUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'User',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  // Reset states when drawer opens or closes
  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        role: 'User',
      });
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = useCallback(
    async (data: CreateUserFormData) => {
      setApiError(null);
      setIsSubmitting(true);

      try {
        const resultAction = await dispatch(
          createUserThunk({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            role: data.role,
          })
        );

        if (createUserThunk.fulfilled.match(resultAction)) {
          onClose();
        } else {
          setApiError(
            (resultAction.payload as string) || USERS_CONSTANTS.createDrawer.defaultError
          );
        }
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : USERS_CONSTANTS.createDrawer.defaultError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, onClose]
  );

  const footerContent = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
        className="text-xs font-semibold py-2.5 px-4"
      >
        {USERS_CONSTANTS.createDrawer.cancelButtonText}
      </Button>
      <Button
        type="submit"
        form="create-user-form"
        variant="primary"
        onClick={() => void handleSubmit(handleFormSubmit)()}
        isLoading={isSubmitting}
        leftIcon={<Image src="/icons/plus-white.svg" alt="" width={15} height={15} />}
        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 px-4"
      >
        {USERS_CONSTANTS.createDrawer.submitButtonText}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={USERS_CONSTANTS.createDrawer.title}
      description={USERS_CONSTANTS.createDrawer.description}
      footer={footerContent}
      width="md"
    >
      <FormProvider {...methods}>
        <form id="create-user-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {apiError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700"
            >
              {apiError}
            </div>
          )}

          {/* 1. First Name */}
          <div>
            <label
              htmlFor="create-firstName"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              {USERS_CONSTANTS.createDrawer.firstNameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-firstName"
              type="text"
              placeholder={USERS_CONSTANTS.createDrawer.firstNamePlaceholder}
              {...register('firstName', {
                required: USERS_CONSTANTS.validation.firstNameRequired,
              })}
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.firstName
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.firstName.message}</p>
            )}
          </div>

          {/* 2. Last Name */}
          <div>
            <label
              htmlFor="create-lastName"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              {USERS_CONSTANTS.createDrawer.lastNameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-lastName"
              type="text"
              placeholder={USERS_CONSTANTS.createDrawer.lastNamePlaceholder}
              {...register('lastName', {
                required: USERS_CONSTANTS.validation.lastNameRequired,
              })}
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.lastName
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.lastName.message}</p>
            )}
          </div>

          {/* 3. Work Email */}
          <div>
            <label htmlFor="create-email" className="block text-xs font-bold text-slate-700 mb-1.5">
              {USERS_CONSTANTS.createDrawer.emailLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-email"
              type="email"
              placeholder={USERS_CONSTANTS.createDrawer.emailPlaceholder}
              {...register('email', {
                required: USERS_CONSTANTS.validation.emailRequired,
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: USERS_CONSTANTS.validation.emailInvalid,
                },
              })}
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* 4. Role Select with Controller & React Select */}
          <div>
            <label htmlFor="create-role" className="block text-xs font-bold text-slate-700 mb-1.5">
              {USERS_CONSTANTS.createDrawer.roleLabel} <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="role"
              control={control}
              rules={{ required: USERS_CONSTANTS.validation.roleRequired }}
              render={({ field }) => (
                <Select<'Admin' | 'Manager' | 'User'>
                  id="create-role"
                  options={CREATE_ROLE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={isSubmitting}
                  isError={Boolean(errors.role)}
                  aria-label={USERS_CONSTANTS.createDrawer.roleLabel}
                />
              )}
            />
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
});

CreateUserDrawer.displayName = 'CreateUserDrawer';
