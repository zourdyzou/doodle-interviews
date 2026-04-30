import { useCallback, useEffect, useRef, useState } from 'react';

import { chatApi } from '@/lib/api/chat.api';

import type { Message, SendMessagePayload } from '@/types/chat';

const POLL_INTERVAL_MS = 5_000;

type State = {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
};

type UseMessagesReturn = State & {
  send: (payload: SendMessagePayload) => Promise<void>;
};

/**
 * Manages the full message lifecycle — initial fetch, polling for new
 * messages every 5s, and sending with optimistic updates.
 *
 * Polling uses the `createdAt` of the latest message as a cursor
 * so we never re-fetch what we already have.
 */
export function useMessages(): UseMessagesReturn {
  const [state, setState] = useState<State>({
    messages: [],
    isLoading: true,
    isSending: false,
    error: null,
  });

  // Holds the createdAt of the most recent message — used as the
  // `after` cursor when polling so we only fetch what's new.
  const latestTimestampRef = useRef<string | null>(null);

  const updateLatestTimestamp = useCallback((messages: Message[]) => {
    if (messages.length === 0) return;
    // API returns reverse chronological order, so first item is newest
    latestTimestampRef.current = messages[0].createdAt;
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      const messages = await chatApi.getMessages({ limit: 50 });

      updateLatestTimestamp(messages);

      setState((prev) => ({
        ...prev,
        // Reverse so oldest renders at top, newest at bottom
        messages: [...messages].reverse(),
        isLoading: false,
        error: null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load messages. Please refresh.',
      }));
    }
  }, [updateLatestTimestamp]);

  const pollForNew = useCallback(async () => {
    // Nothing to poll against yet
    if (!latestTimestampRef.current) return;

    try {
      const newMessages = await chatApi.getMessages({
        after: latestTimestampRef.current,
      });

      if (newMessages.length === 0) return;

      updateLatestTimestamp(newMessages);

      setState((prev) => ({
        ...prev,
        // New messages come in reverse order too — reverse before appending
        messages: [...prev.messages, ...newMessages.reverse()],
        error: null,
      }));
    } catch {
      // Silent — polling failures shouldn't disrupt the UI,
      // the next tick will retry automatically.
    }
  }, [updateLatestTimestamp]);

  /** Posts a message with an optimistic update that rolls back on failure */
  const send = useCallback(
    async (payload: SendMessagePayload) => {
      const optimisticMessage: Message = {
        _id: `optimistic-${Date.now()}`,
        message: payload.message,
        author: payload.author,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        isSending: true,
        error: null,
        messages: [...prev.messages, optimisticMessage],
      }));

      try {
        const saved = await chatApi.sendMessage(payload);

        // Swap out the optimistic message for the real one
        setState((prev) => ({
          ...prev,
          isSending: false,
          messages: prev.messages.map((m) =>
            m._id === optimisticMessage._id ? saved : m,
          ),
        }));

        latestTimestampRef.current = saved.createdAt;
      } catch {
        // Roll back the optimistic message and surface the error
        setState((prev) => ({
          ...prev,
          isSending: false,
          messages: prev.messages.filter((m) => m._id !== optimisticMessage._id),
          error: 'Failed to send message. Please try again.',
        }));
      }
    },
    [],
  );

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    const interval = setInterval(pollForNew, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollForNew]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    send,
  };
}