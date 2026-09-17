'use client';

import React from 'react';
import { useController, useFormContext, FieldValues, Path, Control } from 'react-hook-form';
import { Image } from '@/components/ui/Image';

export interface ControlledCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
  name: TName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<TFieldValues, any>;
  label: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  control,
  label,
  id,
  disabled = false,
  className = '',
}: Readonly<ControlledCheckboxProps<TFieldValues, TName>>) {
  const formContext = useFormContext<TFieldValues>();
  const effectiveControl = control || formContext?.control;

  const { field } = useController({
    name,
    control: effectiveControl,
  });

  const checkboxId = id || `checkbox-${name}`;
  const isChecked = Boolean(field.value);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <label
        htmlFor={checkboxId}
        className={`group relative inline-flex items-center gap-2.5 select-none ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <div className="relative inline-flex items-center justify-center shrink-0">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={`flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-all duration-150 ${
              isChecked
                ? 'border-blue-600 bg-blue-600 text-white shadow-2xs shadow-blue-500/25'
                : 'border-slate-300 bg-white group-hover:border-slate-400 group-hover:bg-slate-50/50'
            } ${
              disabled
                ? 'border-slate-200 bg-slate-100'
                : 'peer-focus-visible:ring-3 peer-focus-visible:ring-blue-500/25'
            }`}
          >
            {isChecked && (
              <Image
                src="/icons/check.svg"
                alt=""
                width={11}
                height={11}
                className="h-2.5 w-2.5 brightness-0 invert pointer-events-none"
              />
            )}
          </div>
        </div>
        <span
          className={`text-xs sm:text-sm font-medium transition-colors ${
            disabled ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'
          }`}
        >
          {label}
        </span>
      </label>
    </div>
  );
}

export default Checkbox;
