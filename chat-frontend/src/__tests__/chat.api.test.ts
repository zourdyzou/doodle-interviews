import { chatApi } from '@/lib/api/chat.api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockMessage = {
  _id: '123',
  message: 'Hello',
  author: 'John',
  createdAt: '2024-01-12T10:30:00.000Z',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('chatApi.getMessages', () => {
  it('returns a validated list of messages on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockMessage],
    });

    const result = await chatApi.getMessages();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ _id: '123', author: 'John' });
  });

  it('appends after param to the request URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await chatApi.getMessages({ after: '2024-01-01T00:00:00.000Z' });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('after=2024-01-01T00%3A00%3A00.000Z');
  });

  it('throws ApiError with the response status on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(chatApi.getMessages()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
  });

  it('throws on invalid response shape', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ broken: true }],
    });

    await expect(chatApi.getMessages()).rejects.toThrow();
  });
});

describe('chatApi.sendMessage', () => {
  it('posts the payload and returns the created message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessage,
    });

    const result = await chatApi.sendMessage({
      message: 'Hello',
      author: 'John',
    });

    expect(result).toMatchObject({ _id: '123' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/messages'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws ApiError on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    await expect(
      chatApi.sendMessage({ message: 'Hi', author: 'John' }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400 });
  });
});