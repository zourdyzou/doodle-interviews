import { act, renderHook, waitFor } from '@testing-library/react';

import { useMessages } from '@/hooks/useMessages';

const mockGetMessages = jest.fn();
const mockSendMessage = jest.fn();

jest.mock('@/lib/api/chat.api', () => ({
  chatApi: {
    getMessages: (...args: unknown[]) => mockGetMessages(...args),
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  },
}));

const makeMessage = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  message: 'Hello',
  author: 'John',
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  mockGetMessages.mockReset();
  mockSendMessage.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useMessages', () => {
  it('loads messages on mount sorted oldest to newest', async () => {
    const older = makeMessage({ createdAt: '2024-01-01T10:00:00.000Z' });
    const newer = makeMessage({ createdAt: '2024-01-01T11:00:00.000Z' });

    // API returns reverse chronological
    mockGetMessages.mockResolvedValueOnce([newer, older]);

    const { result } = renderHook(() => useMessages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages[0].createdAt).toBe(older.createdAt);
    expect(result.current.messages[1].createdAt).toBe(newer.createdAt);
  });

  it('sets error state when initial fetch fails', async () => {
    mockGetMessages.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMessages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.messages).toHaveLength(0);
  });

  it('does not duplicate messages already in the list on poll', async () => {
    const messages = [makeMessage(), makeMessage()];

    // Initial fetch
    mockGetMessages.mockResolvedValue(messages);

    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages).toHaveLength(2);

    // Poll fires — returns same messages
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
  });

  it('appends genuinely new messages from poll', async () => {
    const initial = [makeMessage({ createdAt: '2024-01-01T10:00:00.000Z' })]
    const polled = [
      ...initial,
      makeMessage({ createdAt: '2024-01-01T11:00:00.000Z' }),
    ];

    mockGetMessages
      .mockResolvedValueOnce(initial)
      .mockResolvedValue(polled);

    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages).toHaveLength(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
  });

  it('shows optimistic message immediately then replaces with saved', async () => {
    mockGetMessages.mockResolvedValue([]);
    const saved = makeMessage({ message: 'Hey', author: 'Me' });
    mockSendMessage.mockResolvedValueOnce(saved);

    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.send({ message: 'Hey', author: 'Me' });
    });

    // Optimistic message appears immediately
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]._id).toMatch(/^optimistic-/);

    await waitFor(() => {
      // Replaced with real message
      expect(result.current.messages[0]._id).toBe(saved._id);
    });
  });

  it('rolls back optimistic message on send failure', async () => {
    mockGetMessages.mockResolvedValue([]);
    mockSendMessage.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.send({ message: 'Hey', author: 'Me' });
    });

    expect(result.current.messages).toHaveLength(1);

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(0);
      expect(result.current.error).toBeTruthy();
    });
  });
});