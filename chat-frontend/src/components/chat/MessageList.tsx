import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { MessageBubble } from '@/components/chat/MessageBubble';

import type { Message } from '@/types/chat';

type Props = {
  messages: Message[];
  sentMessageIds: Set<string>;
  isLoading: boolean;
};

/**
 * Scrollable message list — auto-scrolls to the bottom whenever
 * a new message arrives. Loading state renders skeleton bubbles.
 */
export function MessageList({ messages, sentMessageIds, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div
        aria-label='Loading messages'
        aria-busy='true'
        className='flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4'
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-16 w-64 animate-pulse rounded-lg bg-white/60',
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
      className='flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4'
    >
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={sentMessageIds.has(message._id)}
        />
      ))}
      <div ref={bottomRef} aria-hidden='true' />
    </div>
  );
}