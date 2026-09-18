'use client';

import React, { memo, useState, useEffect, useId } from 'react';
import ReactSelect, {
  Props as ReactSelectProps,
  StylesConfig,
  GroupBase,
  SingleValue,
} from 'react-select';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface CustomSelectProps<T = string> extends Omit<
  ReactSelectProps<SelectOption<T>, false, GroupBase<SelectOption<T>>>,
  'value' | 'onChange' | 'options'
> {
  options?: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  isError?: boolean;
  id?: string;
  className?: string;
}

const getControlBorderColor = (isError: boolean, isFocused: boolean): string => {
  if (isError) return '#fca5a5';
  if (isFocused) return '#3b82f6';
  return '#e2e8f0';
};

const getControlBoxShadow = (isError: boolean, isFocused: boolean): string => {
  if (!isFocused) return 'none';
  if (isError) return '0 0 0 2px rgba(244, 63, 94, 0.2)';
  return '0 0 0 2px rgba(59, 130, 246, 0.2)';
};

const getHoverBorderColor = (isError: boolean, isFocused: boolean): string => {
  if (isError) return '#f87171';
  if (isFocused) return '#3b82f6';
  return '#cbd5e1';
};

const getOptionBackgroundColor = (isSelected: boolean, isFocused: boolean): string => {
  if (isSelected) return '#eff6ff';
  if (isFocused) return '#f8fafc';
  return 'transparent';
};

export const Select = memo(function Select<T = string>({
  options = [],
  value,
  onChange,
  isError = false,
  isDisabled = false,
  placeholder = 'Select an option...',
  id,
  className = '',
  ...rest
}: CustomSelectProps<T>) {
  const generatedId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption: SelectOption<T> | null = options.find((opt) => opt.value === value) || null;

  const customStyles: StylesConfig<SelectOption<T>, false, GroupBase<SelectOption<T>>> = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderRadius: '0.75rem', // rounded-xl
      borderColor: getControlBorderColor(isError, state.isFocused),
      boxShadow: getControlBoxShadow(isError, state.isFocused),
      backgroundColor: isDisabled ? '#f8fafc' : '#ffffff',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s ease-in-out',
      '&:hover': {
        borderColor: getHoverBorderColor(isError, state.isFocused),
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 14px',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#0f172a',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.875rem',
      color: '#94a3b8',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      padding: '4px',
      zIndex: 99999,
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      padding: '2px',
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      padding: '8px 12px',
      backgroundColor: getOptionBackgroundColor(state.isSelected, state.isFocused),
      color: state.isSelected ? '#2563eb' : '#334155',
      cursor: 'pointer',
      transition: 'background-color 0.1s ease',
      '&:active': {
        backgroundColor: '#dbeafe',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#3b82f6' : '#94a3b8',
      padding: '8px',
      transition: 'transform 0.2s ease, color 0.15s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
      '&:hover': {
        color: '#64748b',
      },
    }),
  };

  const handleSelectChange = (option: SingleValue<SelectOption<T>>) => {
    if (onChange && option) {
      onChange(option.value);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <ReactSelect<SelectOption<T>, false, GroupBase<SelectOption<T>>>
        instanceId={id || generatedId}
        inputId={id}
        options={options}
        value={selectedOption}
        onChange={handleSelectChange}
        isDisabled={isDisabled}
        placeholder={placeholder}
        styles={customStyles}
        isSearchable={false}
        menuPlacement="auto"
        menuPosition="fixed"
        menuShouldScrollIntoView={false}
        menuPortalTarget={mounted && typeof document !== 'undefined' ? document.body : null}
        maxMenuHeight={220}
        {...rest}
      />
    </div>
  );
}) as <T = string>(props: CustomSelectProps<T>) => React.ReactElement;
