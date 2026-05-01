import { format } from 'date-fns';

import { cn } from '@/lib/utils';

import type { Message } from '@/types/chat';

type Props = {
  message: Message;
  isOwn: boolean;
};

/**
 * Renders a single chat bubble.
 * Own messages sit on the right with a warm yellow background,
 * everyone else's sit on the left on white.
 */
export function MessageBubble({ message, isOwn }: Props) {
  const formattedDate = format(new Date(message.createdAt), 'd MMM yyyy H:mm');

  return (
    <div
      className={cn(
        'flex w-full',
        isOwn ? 'justify-end' : 'justify-start',
      )}
    >
      <article
        aria-label={`Message from ${message.author}`}
        className={cn(
          'flex max-w-[640px] flex-col gap-1 rounded-lg px-4 py-4',
          isOwn
            ? 'bg-[#fdf9c4] text-right'
            : 'bg-white text-left',
        )}
      >
        {!isOwn && (
          <span className='text-sm font-normal text-gray-400'>
            {message.author}
          </span>
        )}
        <p className='text-base font-bold text-gray-800 break-words'>
          {message.message}
        </p>
        <time
          dateTime={message.createdAt}
          className='text-sm text-gray-400'
        >
          {formattedDate}
        </time>
      </article>
    </div>
  );
}