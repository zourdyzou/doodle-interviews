import { messageSchema, messagesSchema } from '@/lib/api/chat.schema';

import type {
  GetMessagesParams,
  Message,
  SendMessagePayload,
} from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const API_TOKEN =
  process.env.NEXT_PUBLIC_API_TOKEN ?? 'super-secret-doodle-token';

/**
 * Thrown on any non-2xx response so callers can branch on status code
 * without having to inspect raw Response objects.
 */
class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getBaseHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
});

/**
 * Shared response handler — throws on bad status, parses JSON,
 * then runs it through whatever schema the caller passes in.
 */
async function handleResponse<T>(
  res: Response,
  parse: (data: unknown) => T
): Promise<T> {
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  return parse(json);
}

export const chatApi = {
  /**
   * Fetches messages in reverse chronological order.
   * Pass `after` to poll for new ones since your last fetch.
   */
  getMessages: async (params?: GetMessagesParams): Promise<Message[]> => {
    const url = new URL(`${API_BASE_URL}/api/v1/messages`);

    if (params?.after) url.searchParams.set('after', params.after);
    if (params?.before) url.searchParams.set('before', params.before);
    if (params?.limit != null)
      url.searchParams.set('limit', String(params.limit));

    const res = await fetch(url.toString(), { headers: getBaseHeaders() });

    return handleResponse(res, (data) => messagesSchema.parse(data));
  },

  /** Posts a new message and returns it with its generated `_id` and `createdAt` */
  sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/messages`, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse(res, (data) => messageSchema.parse(data));
  },
};
