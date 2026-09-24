'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Drawer, Button, Avatar, Image, Select, Input } from '@/components/ui';
import { useAppDispatch, updateUserThunk, UserRecord } from '@/store';
import {
  USERS_CONSTANTS,
  STANDARD_ROLE_OPTIONS,
  TASKFLOW_ADMIN_ROLE_OPTIONS,
  STATUS_OPTIONS,
  EditUserRole,
} from '@/constants';

export interface EditUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
}

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: EditUserRole;
  isActive: boolean;
}

export const EditUserDrawer = memo(function EditUserDrawer({
  isOpen,
  onClose,
  user,
}: EditUserDrawerProps) {
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTaskflowAdmin = useMemo(() => user?.role === 'Taskflow Admin', [user?.role]);

  const methods = useForm<EditUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'Developer',
      isActive: true,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  // Populate form with current user data when drawer opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email.toLowerCase(),
        role: (user.role as EditUserRole) || 'Developer',
        isActive: user.isActive !== false,
      });
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, user, reset]);

  const handleFormSubmit = useCallback(
    async (data: EditUserFormData) => {
      setApiError(null);
      setIsSubmitting(true);

      const resultAction = await dispatch(
        updateUserThunk({
          id: user!._id,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: user!.email.trim().toLowerCase(),
          role: isTaskflowAdmin ? 'Taskflow Admin' : data.role,
          isActive: data.isActive,
        })
      );

      setIsSubmitting(false);

      if (updateUserThunk.fulfilled.match(resultAction)) {
        onClose();
      } else {
        setApiError((resultAction.payload as string) || USERS_CONSTANTS.editDrawer.defaultError);
      }
    },
    [dispatch, user, isTaskflowAdmin, onClose]
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
        {USERS_CONSTANTS.editDrawer.cancelButtonText}
      </Button>
      <Button
        type="submit"
        form="edit-user-form"
        variant="primary"
        isLoading={isSubmitting}
        leftIcon={<Image src="/icons/user-check-white.svg" alt="" width={15} height={15} />}
        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 px-4"
      >
        {USERS_CONSTANTS.editDrawer.submitButtonText}
      </Button>
    </div>
  );

  if (!user) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={USERS_CONSTANTS.editDrawer.title}
      description={USERS_CONSTANTS.editDrawer.description}
      footer={footerContent}
      width="md"
    >
      <FormProvider {...methods}>
        <form id="edit-user-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Member Profile Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  {user.userId || 'TF0001'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate lowercase">{user.email}</p>
            </div>
          </div>

          {apiError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700"
            >
              {apiError}
            </div>
          )}

          {/* 1. First Name */}
          <Input<EditUserFormData>
            id="edit-firstName"
            name="firstName"
            type="text"
            label={USERS_CONSTANTS.editDrawer.firstNameLabel}
            required
            disabled={isSubmitting}
            rules={{ required: USERS_CONSTANTS.validation.firstNameRequired }}
          />

          {/* 2. Last Name */}
          <Input<EditUserFormData>
            id="edit-lastName"
            name="lastName"
            type="text"
            label={USERS_CONSTANTS.editDrawer.lastNameLabel}
            required
            disabled={isSubmitting}
            rules={{ required: USERS_CONSTANTS.validation.lastNameRequired }}
          />

          {/* 3. Work Email (Read-Only) */}
          <Input<EditUserFormData>
            id="edit-email"
            name="email"
            type="email"
            label={USERS_CONSTANTS.editDrawer.emailLabel}
            rightAction={
              <span className="text-[11px] text-slate-400 font-medium">
                {USERS_CONSTANTS.editDrawer.cannotBeModified}
              </span>
            }
            disabled
            readOnly
            className="lowercase select-all"
          />

          {/* 4. Role Select with Controller & React Select */}
          <div>
            <label htmlFor="edit-role" className="block text-xs font-bold text-slate-700 mb-1.5">
              {USERS_CONSTANTS.editDrawer.roleLabel}{' '}
              {isTaskflowAdmin && (
                <span className="text-slate-400 font-normal">
                  {USERS_CONSTANTS.editDrawer.protectedRole}
                </span>
              )}
            </label>
            <Controller
              name="role"
              control={control}
              rules={{ required: USERS_CONSTANTS.validation.roleRequired }}
              render={({ field }) => (
                <Select<string>
                  id="edit-role"
                  options={isTaskflowAdmin ? TASKFLOW_ADMIN_ROLE_OPTIONS : STANDARD_ROLE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={isSubmitting || isTaskflowAdmin}
                  isError={Boolean(errors.role)}
                  aria-label={USERS_CONSTANTS.editDrawer.roleLabel}
                />
              )}
            />
          </div>

          {/* 5. Account Status with Controller & React Select */}
          <div>
            <label htmlFor="edit-status" className="block text-xs font-bold text-slate-700 mb-1.5">
              {USERS_CONSTANTS.editDrawer.statusLabel}
            </label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select<boolean>
                  id="edit-status"
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={isSubmitting || isTaskflowAdmin}
                  aria-label={USERS_CONSTANTS.editDrawer.statusLabel}
                />
              )}
            />
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
});

EditUserDrawer.displayName = 'EditUserDrawer';
