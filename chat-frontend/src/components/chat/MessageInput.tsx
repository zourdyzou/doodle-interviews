import { KeyboardEvent, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  onSend: (message: string) => void;
  isSending: boolean;
  disabled?: boolean;
};

const MAX_LENGTH = 500;

/**
 * Fixed input bar at the bottom of the chat.
 * Sends on Enter (without Shift), Shift+Enter inserts a newline.
 * Disabled while a message is in-flight to prevent double sends.
 */
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
    <div className='flex items-center gap-2 bg-[#4aaec9] px-2 py-2'>
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
        aria-disabled={isSending || disabled}
        className={cn(
          'flex-1 resize-none rounded-md border-0 bg-white px-4 py-3',
          'text-base text-gray-800 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          'disabled:opacity-50',
        )}
      />
      <button
        type='button'
        onClick={handleSend}
        disabled={!canSend}
        aria-label='Send message'
        className={cn(
          'rounded-md bg-[#e8644a] px-6 py-3',
          'text-base font-semibold text-white',
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