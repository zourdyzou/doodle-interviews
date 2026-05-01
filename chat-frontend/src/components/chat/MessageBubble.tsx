import { format } from 'date-fns';

import { cn } from '@/lib/utils';

import type { Message } from '@/types/chat';

type Props = {
  message: Message;
  isOwn: boolean;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function MessageBubble({ message, isOwn }: Props) {
  const formattedDate = format(new Date(message.createdAt), 'd MMM yyyy H:mm');

  return (
    <div className={cn('flex w-full px-4', isOwn ? 'justify-end' : 'justify-start')}>
      <article
        aria-label={`Message from ${message.author}`}
        className={cn(
          'flex flex-col gap-1 rounded-2xl px-4 py-3 w-fit max-w-[min(640px,85%)]',
          'shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          isOwn
            ? 'bg-[#fdf9c4] items-end'
            : 'bg-white items-start',
        )}
      >
        {!isOwn && (
          <span className='text-xs font-semibold text-gray-400 tracking-wide'>
            {message.author}
          </span>
        )}
        <p className='text-sm text-gray-800 break-words leading-relaxed'>
          {decodeEntities(message.message)}
        </p>
        <time
          dateTime={message.createdAt}
          className='text-xs text-gray-400 mt-0.5'
        >
          {formattedDate}
        </time>
      </article>
    </div>
  );
}