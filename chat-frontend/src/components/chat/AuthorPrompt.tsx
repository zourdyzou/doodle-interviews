import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  onConfirm: (name: string) => void;
};

const AUTHOR_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;
const MAX_LENGTH = 50;

export function AuthorPrompt({ onConfirm }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input after mount instead of using autoFocus
  // to avoid SSR hydration mismatches
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = (name: string): string | null => {
    if (name.trim().length === 0) return 'Name cannot be empty';
    if (!AUTHOR_PATTERN.test(name)) return 'Only letters, numbers, spaces, hyphens and underscores';
    return null;
  };

  const handleConfirm = () => {
    const trimmed = value.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirm();
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='author-prompt-title'
      className='flex h-full flex-col items-center justify-center gap-4 px-6'
    >
      <h1
        id='author-prompt-title'
        className='text-xl font-semibold text-gray-700'
      >
        What should we call you?
      </h1>
      <div className='flex w-full max-w-sm flex-col gap-2'>
        <label htmlFor='author-input' className='sr-only'>
          Your display name
        </label>
        <input
          suppressHydrationWarning
          ref={inputRef}
          id='author-input'
          type='text'
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          placeholder='Your name'
          aria-describedby={error ? 'author-error' : undefined}
          className={cn(
            'w-full rounded-md border bg-white px-4 py-3',
            'text-base text-gray-800 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#4aaec9]',
            error ? 'border-red-400' : 'border-gray-200',
          )}
        />
        {error && (
          <p id='author-error' role='alert' className='text-sm text-red-500'>
            {error}
          </p>
        )}
        <button
          suppressHydrationWarning
          type='button'
          onClick={handleConfirm}
          className={cn(
            'rounded-md bg-[#4aaec9] px-6 py-3',
            'text-base font-semibold text-white',
            'hover:opacity-90 active:opacity-75 transition-opacity duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4aaec9]',
          )}
        >
          Join chat
        </button>
      </div>
    </div>
  );
}