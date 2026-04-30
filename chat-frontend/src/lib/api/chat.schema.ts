import { z } from 'zod';

/** Matches the Message schema in the API docs exactly */
export const messageSchema = z.object({
  _id: z.string(),
  message: z.string().min(1).max(500),
  author: z.string().min(1).max(50),
  createdAt: z.string().datetime(),
});

export const messagesSchema = z.array(messageSchema);
