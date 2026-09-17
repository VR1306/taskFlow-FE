'use client';

import React, { memo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { useAppDispatch, createUserThunk } from '@/store';

export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'User' | 'Admin' | 'SuperAdmin';
}

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateUserModal = memo(function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'User',
    },
  });

  const handleModalClose = useCallback(() => {
    reset();
    setServerError(null);
    onClose();
  }, [onClose, reset]);

  const onSubmit = useCallback(
    async (data: CreateUserFormData) => {
      try {
        setIsSubmitting(true);
        setServerError(null);
        const resultAction = await dispatch(createUserThunk(data));

        if (createUserThunk.fulfilled.match(resultAction)) {
          handleModalClose();
          onSuccess?.();
        } else if (createUserThunk.rejected.match(resultAction)) {
          setServerError((resultAction.payload as string) || 'Failed to create user.');
        }
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, handleModalClose, onSuccess]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create New User"
      description="Add a new member to your workspace. Temporary login credentials will be emailed to them automatically."
      maxWidth="md"
      showCloseButton={!isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2"
          >
            <Image src="/icons/alert-circle.svg" alt="" width={16} height={16} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="create-firstName"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-firstName"
              type="text"
              placeholder="e.g. Alexander"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
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

          {/* Last Name */}
          <div>
            <label
              htmlFor="create-lastName"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-lastName"
              type="text"
              placeholder="e.g. Wright"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 1, message: 'Last name cannot be empty' },
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
        </div>

        {/* Email */}
        <div>
          <label htmlFor="create-email" className="block text-xs font-bold text-slate-700 mb-1.5">
            Work Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="create-email"
            type="email"
            placeholder="member@company.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email address',
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

        {/* Role Select */}
        <div>
          <label htmlFor="create-role" className="block text-xs font-bold text-slate-700 mb-1.5">
            Role & Permissions <span className="text-rose-500">*</span>
          </label>
          <select
            id="create-role"
            {...register('role', { required: 'Role is required' })}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="User">User (Standard Workspace Access)</option>
            <option value="Admin">Admin (Management & Config Access)</option>
            <option value="SuperAdmin">SuperAdmin (Full System Controls)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs font-semibold text-slate-700"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs font-semibold bg-blue-600 hover:bg-blue-700 gap-1.5"
          >
            <Image src="/icons/plus.svg" alt="" width={14} height={14} className="brightness-200" />
            <span>Create User</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
});

CreateUserModal.displayName = 'CreateUserModal';

export default CreateUserModal;
