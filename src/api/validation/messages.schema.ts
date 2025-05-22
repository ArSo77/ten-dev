import { z } from 'zod';

/**
 * Validation schema for message creation input
 */
export const createMessageSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  recipient_ids: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
  sender_id: z.string().uuid()
});

/**
 * Validation schema for message listing query parameters
 */
export const messagesQueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  sort: z.string().optional().default('sent_at:desc'),
  recipient_id: z.string().optional()
});

export type MessagesQueryParamsType = z.infer<typeof messagesQueryParamsSchema>;

/**
 * Validation schema for message ID (UUID format)
 */
export const messageIdSchema = z.string().uuid({
  message: "Invalid message ID format. Must be a valid UUID."
});

export type MessageIdSchemaType = z.infer<typeof messageIdSchema>; 