import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  recipient_ids: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
  sender_id: z.string().uuid()
}); 