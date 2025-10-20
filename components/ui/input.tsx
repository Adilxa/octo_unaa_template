import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className='relative w-full'>
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={cn(
            'flex h-10 w-full rounded-md border border-[#1D3253] bg-[#01030E] px-4 py-2 text-base text-white placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#1D3253] disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type='button'
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'
            onClick={() => setShowPassword(prev => !prev)}
          >
            {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
