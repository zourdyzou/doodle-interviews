'use client';

import { useAuthor } from '@/hooks/useAuthor';
import { useMessages } from '@/hooks/useMessages';

import { AuthorPrompt, MessageInput, MessageList } from '@/components/chat';

export default function ChatPage() {
  const { author, setAuthor } = useAuthor();
  const { messages, isLoading, isSending, error, send } = useMessages();

  const handleSend = async (message: string) => {
    if (!author) return;
    await send({ message, author });
  };

  return (
    <main
      className='relative flex h-dvh flex-col bg-repeat'
      style={{ backgroundImage: 'url(/images/body-bg.png)' }}
    >
      {!author ? (
        <AuthorPrompt onConfirm={setAuthor} />
      ) : (
        <>
          {error && (
            <div
              role='alert'
              className='shrink-0 bg-red-500 px-4 py-2 text-center text-sm text-white'
            >
              {error}
            </div>
          )}
          <MessageList
            messages={messages}
            currentAuthor={author}
            isLoading={isLoading}
          />
          <MessageInput
            onSend={handleSend}
            isSending={isSending}
          />
        </>
      )}
    </main>
  );
}