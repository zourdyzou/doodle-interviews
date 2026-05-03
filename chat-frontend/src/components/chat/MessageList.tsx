import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { MessageBubble } from '@/components/chat/MessageBubble';

import type { Message } from '@/types/chat';

type Props = {
  messages: Message[];
  currentAuthor: string;
  isLoading: boolean;
};

export function MessageList({ messages, currentAuthor, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div
        aria-label='Loading messages'
        aria-busy='true'
        className='flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4'
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-14 w-48 animate-pulse rounded-2xl',
              'bg-white/80 shadow-sm',
              i % 2 === 0 ? 'self-start' : 'self-end',
            )}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-sm text-gray-400'>No messages yet. Say something!</p>
      </div>
    );
  }

  return (
    <div
      role='log'
      aria-label='Chat messages'
      aria-live='polite'
      className={cn(
        'flex flex-1 flex-col gap-2 overflow-y-auto py-4',
        '[&::-webkit-scrollbar]:w-0',
      )}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.author === currentAuthor}
        />
      ))}
      <div ref={bottomRef} aria-hidden='true' />
    </div>
  );
}