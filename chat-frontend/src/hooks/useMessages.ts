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

/** Merges incoming messages into the existing list, deduplicating by `_id` */
function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const seen = new Set(existing.map((m) => m._id));
  const fresh = incoming.filter((m) => !seen.has(m._id));
  return [...existing, ...fresh];
}

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

  // Tracks _ids of messages sent in this session so the UI
  // can style them as "own" regardless of author name collisions.
  const sentMessageIds = useRef<Set<string>>(new Set());

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
    if (!latestTimestampRef.current) return;

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
      // Silent — polling failures shouldn't disrupt the UI,
      // next tick will retry automatically.
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

      // Track the real _id as "sent by us this session"
      sentMessageIds.current.add(saved._id);

      // Swap optimistic placeholder for the real message
      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: prev.messages.map((m) =>
          m._id === optimisticId ? saved : m,
        ),
      }));

      latestTimestampRef.current = saved.createdAt;
    } catch {
      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: prev.messages.filter((m) => m._id !== optimisticId),
        error: 'Failed to send message. Please try again.',
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
    // Expose as a plain Set so referential equality doesn't matter
    sentMessageIds: sentMessageIds.current,
    send,
  };
}