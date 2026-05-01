import { KeyboardEvent, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  onSend: (message: string) => void;
  isSending: boolean;
  disabled?: boolean;
};

const MAX_LENGTH = 500;

export function MessageInput({ onSend, isSending, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isSending && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='flex items-center gap-2 bg-[#4aaec9] px-3 py-3 shrink-0'>
      <label htmlFor='message-input' className='sr-only'>
        Type a message
      </label>
      <textarea
        ref={textareaRef}
        id='message-input'
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_LENGTH}
        disabled={isSending || disabled}
        placeholder='Message'
        aria-label='Message input'
        className={cn(
          'flex-1 resize-none rounded-lg border-0 bg-white px-4 py-3',
          'text-sm text-gray-800 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-white/40',
          'disabled:opacity-50 leading-relaxed',
        )}
      />
      <button
        type='button'
        onClick={handleSend}
        disabled={!canSend}
        aria-label='Send message'
        className={cn(
          'rounded-lg bg-[#e8644a] px-5 py-3 shrink-0',
          'text-sm font-semibold text-white tracking-wide',
          'transition-opacity duration-150',
          'hover:opacity-90 active:opacity-75',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        )}
      >
        {isSending ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}