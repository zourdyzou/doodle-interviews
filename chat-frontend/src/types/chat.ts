/** Shape of a message coming back from the API */
export type Message = {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
};

/** All three params are optional — omitting them returns the latest 50 messages */
export type GetMessagesParams = {
  /** ISO 8601 — only return messages after this point in time */
  after?: string;
  /** ISO 8601 — only return messages before this point in time */
  before?: string;
  /** Defaults to 50, max 1000 */
  limit?: number;
};

/** Body sent when posting a new message */
export type SendMessagePayload = {
  /** Max 500 chars */
  message: string;
  /** Max 50 chars — only letters, numbers, spaces, hyphens and underscores */
  author: string;
};
