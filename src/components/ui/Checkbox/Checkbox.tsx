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
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative inline-flex items-center justify-center shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          disabled={disabled}
          className="peer h-4.5 w-4.5 cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition-all duration-150 checked:border-blue-600 checked:bg-blue-600 hover:border-slate-400 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs"
        />
        <Image
          src="/icons/check.svg"
          alt=""
          width={12}
          height={12}
          className="pointer-events-none absolute h-3 w-3 transition-all duration-150 ease-out opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100"
        />
      </div>
      <label
        htmlFor={checkboxId}
        className={`cursor-pointer text-xs sm:text-sm font-medium transition-colors select-none ${
          disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:text-slate-900'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export default Checkbox;
