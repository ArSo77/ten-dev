import { z } from 'zod';

/**
 * Validation schema for creating a new user (pilot account)
 */
export const createUserSchema = z.object({
  nick: z.string().min(1).max(50),
  email: z.string().email().nullable(),
  roles: z.literal('pilot')
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

/**
 * Validation schema for user ID (UUID format)
 */
export const userIdSchema = z.string().uuid({
  message: "Invalid user ID format. Must be a valid UUID."
});

export type UserIdSchemaType = z.infer<typeof userIdSchema>; 