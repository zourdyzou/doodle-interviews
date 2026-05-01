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
  sentMessageIds: Set<string>;
  send: (payload: SendMessagePayload) => Promise<void>;
};

/** Merges incoming messages, deduplicating by `_id` */
function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const seen = new Set(existing.map((m) => m._id));
  const fresh = incoming.filter((m) => !seen.has(m._id));
  return [...existing, ...fresh];
}

export function useMessages(): UseMessagesReturn {
  const [state, setState] = useState<State>({
    messages: [],
    isLoading: true,
    isSending: false,
    error: null,
  });

  const sentMessageIds = useRef<Set<string>>(new Set());
  const latestTimestampRef = useRef<string | null>(null);
  // Guard — polling must not start until initial fetch completes
  const isReadyRef = useRef(false);

  const updateLatestTimestamp = useCallback((messages: Message[]) => {
    if (messages.length === 0) return;
    // API returns reverse chronological — index 0 is the newest
    latestTimestampRef.current = messages[0].createdAt;
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      const messages = await chatApi.getMessages({ limit: 50 });
      updateLatestTimestamp(messages);

      setState((prev) => ({
        ...prev,
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
    } finally {
      isReadyRef.current = true;
    }
  }, [updateLatestTimestamp]);

  const pollForNew = useCallback(async () => {
    // Don't poll until initial fetch is done and we have a cursor
    if (!isReadyRef.current || !latestTimestampRef.current) return;

    try {
      const newMessages = await chatApi.getMessages({
        after: latestTimestampRef.current,
      });

      if (newMessages.length === 0) return;

      updateLatestTimestamp(newMessages);

      setState((prev) => ({
        ...prev,
        messages: mergeMessages(prev.messages, [...newMessages].reverse()),
        error: null,
      }));
    } catch {
      // Silent — next tick will retry
    }
  }, [updateLatestTimestamp]);

  const send = useCallback(async (payload: SendMessagePayload) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: optimisticId,
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
      sentMessageIds.current.add(saved._id);

      // Update timestamp so next poll doesn't re-fetch this message
      latestTimestampRef.current = saved.createdAt;

      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: prev.messages.map((m) =>
          m._id === optimisticId ? saved : m,
        ),
      }));
    } catch {
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
    sentMessageIds: sentMessageIds.current,
    send,
  };
}