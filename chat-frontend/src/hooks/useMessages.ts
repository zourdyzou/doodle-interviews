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

function sortByDate(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function useMessages(): UseMessagesReturn {
  const [state, setState] = useState<State>({
    messages: [],
    isLoading: true,
    isSending: false,
    error: null,
  });

  const optimisticMessages = useRef<Map<string, Message>>(new Map());
  const isReadyRef = useRef(false);
  const isPollingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  /**
   * Merges server messages with any in-flight optimistic ones.
   * Server is always the source of truth — optimistic messages
   * are only shown until the server confirms them.
   */
  const mergeWithOptimistic = useCallback((serverMessages: Message[]): Message[] => {
    const serverIds = new Set(serverMessages.map((m) => m._id));

    // Keep only optimistic messages not yet confirmed by server
const pendingOptimistic = Array.from(optimisticMessages.current.values()).filter(
  (m) => !serverIds.has(m._id),
);

    return sortByDate([...serverMessages, ...pendingOptimistic]);
  }, []);

  const fetchInitial = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    try {
      const messages = await chatApi.getMessages({ limit: 50 });

      setState((prev) => ({
        ...prev,
        messages: mergeWithOptimistic(messages),
        isLoading: false,
        error: null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load messages. Please refresh.',
      }));
    } finally {
      isReadyRef.current = true;
    }
  }, [mergeWithOptimistic]);

  const pollForNew = useCallback(async () => {
    if (!isReadyRef.current) return;
    if (isPollingRef.current) return;

    isPollingRef.current = true;

    try {
      const messages = await chatApi.getMessages({ limit: 50 });

      // Replace the list entirely — server is source of truth.
      // Optimistic messages are layered on top until confirmed.
      setState((prev) => ({
        ...prev,
        messages: mergeWithOptimistic(messages),
        error: null,
      }));
    } catch {
      // Silent — next tick retries
    } finally {
      isPollingRef.current = false;
    }
  }, [mergeWithOptimistic]);

  const send = useCallback(async (payload: SendMessagePayload) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: optimisticId,
      message: payload.message,
      author: payload.author,
      createdAt: new Date().toISOString(),
    };

    // Track in-flight optimistic message
    optimisticMessages.current.set(optimisticId, optimisticMessage);

    setState((prev) => ({
      ...prev,
      isSending: true,
      error: null,
      messages: sortByDate([...prev.messages, optimisticMessage]),
    }));

    try {
      const saved = await chatApi.sendMessage(payload);

      // Remove optimistic — next poll or state update will show the real one
      optimisticMessages.current.delete(optimisticId);

      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: sortByDate(
          prev.messages
            .filter((m) => m._id !== optimisticId)
            .concat(saved),
        ),
      }));
    } catch {
      optimisticMessages.current.delete(optimisticId);

      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: prev.messages.filter((m) => m._id !== optimisticId),
        error: 'Failed to send. Please try again.',
      }));
    }
  }, []);

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