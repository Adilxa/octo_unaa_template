import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ValidationOptions {
  required?: boolean;
  pattern?: RegExp;
  errorMessage?: string;
  customValidate?: (value: string) => boolean;
}

interface Props {
  title: string;
  placeholder?: string;
  value: string;
  onChange?: ((value: string) => void) | Dispatch<SetStateAction<string>>;
  isTextArea?: boolean;
  validation?: ValidationOptions;
  type?: string;
}

const FormInput: React.FC<Props> = ({
  title,
  placeholder,
  value,
  onChange,
  isTextArea = false,
  validation,
  type,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) {
      validateInput(value);
    }
  }, [value, touched]);

  const validateInput = (inputValue: string) => {
    if (!validation) return;

    if (validation.required && !inputValue.trim()) {
      setError(`${title} is required`);
      return;
    }

    // Only validate non-empty values with pattern
    if (validation.pattern && inputValue.trim() && !validation.pattern.test(inputValue)) {
      setError(validation.errorMessage || `Invalid ${title.toLowerCase()}`);
      return;
    }

    if (validation.customValidate && !validation.customValidate(inputValue)) {
      setError(validation.errorMessage || `Invalid ${title.toLowerCase()}`);
      return;
    }

    setError(null);
  };

  const handleChange = (value: string) => {
    if (onChange) {
      // Handle both function types
      if (typeof onChange === 'function') {
        onChange(value);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validateInput(value);
  };

  return (
    <div className='flex flex-col gap-1'>
      <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
        <h1 className='w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'>
          {title} {validation?.required && <span className='text-red-500'>*</span>}
        </h1>
        {isTextArea ? (
          <Textarea
            className={`rounded-[6px] border-[1px] ${
              error ? 'border-red-500' : 'border-[#1D3253]'
            } py-5`}
            placeholder={placeholder}
            onChange={(e: any) => handleChange(e.target.value)}
            onBlur={handleBlur}
            value={value}
          />
        ) : (
          <Input
            className={`rounded-[6px] border-[1px] ${
              error ? 'border-red-500' : 'border-[#1D3253]'
            } py-5`}
            value={value}
            placeholder={placeholder}
            onChange={e => handleChange(e.target.value)}
            onBlur={handleBlur}
            type={type}
          />
        )}
      </div>
      {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
    </div>
  );
};

export default FormInput;
