'use client';

import React from 'react';
import { useController, useFormContext, FieldValues, Path, Control } from 'react-hook-form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: TName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<TFieldValues, any>;
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  trailingAction?: React.ReactNode;
  containerClassName?: string;
  errorMessage?: string;
}

export function Input<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  control,
  label,
  required = false,
  icon,
  rightAction,
  trailingAction,
  containerClassName = '',
  className = '',
  type = 'text',
  id,
  disabled,
  placeholder,
  errorMessage: customErrorMessage,
  ...props
}: Readonly<ControlledInputProps<TFieldValues, TName>>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: effectiveControl,
  });

  const inputId = id || `input-${name}`;
  const errorId = `${inputId}-error`;
  const activeError = customErrorMessage || error?.message;

  return (
    <div className={`w-full flex flex-col ${containerClassName}`}>
      {/* Label and Right Action (e.g., Forgot Password link) */}
      {(label || rightAction) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
              {label}
              {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
          )}
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}

      {/* Input Field with optional leading icon and trailing action */}
      <div className="relative flex items-center">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
            {icon}
          </div>
        )}

        <input
          {...field}
          {...props}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(activeError)}
          aria-describedby={activeError ? errorId : undefined}
          className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all duration-200 outline-none ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${trailingAction ? 'pr-10' : 'pr-3.5'} ${
            activeError
              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
        />

        {trailingAction && (
          <div className="absolute right-3 flex items-center">{trailingAction}</div>
        )}
      </div>

      {/* Error Message Component */}
      <ErrorMessage id={errorId} message={activeError} />
    </div>
  );
}

export default Input;
