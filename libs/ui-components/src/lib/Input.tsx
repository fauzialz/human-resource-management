import React from 'react';

interface InputProps extends React.ComponentProps<'input'> {
  error?: string;
  floatRight?: React.ReactNode;
}

export function Input({ error, floatRight, className, ...props }: InputProps) {
  const base =
    'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2';
  const state = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-blue-500';

  return (
    <div className="w-full">
      <div className="relative">
        <input className={`${base} ${state} ${className ?? ''}`} {...props} />
        {floatRight && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {floatRight}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
