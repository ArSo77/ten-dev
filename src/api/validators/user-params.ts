import { z } from 'zod';

/**
 * Zod schema for validating user listing query parameters
 * Validates role (optional), page (>=1), and limit (>=1)
 */
export const userParamsSchema = z.object({
  role: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export type UserQueryParams = z.infer<typeof userParamsSchema>;

/**
 * Validates user listing query parameters
 * @param params - Object containing the query parameters
 * @returns Validated and typed parameters or throws validation error
 */
export function validateUserParams(params: Record<string, any>): UserQueryParams {
  try {
    return userParamsSchema.parse({
      role: params.role,
      page: params.page,
      limit: params.limit
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Collect all validation errors
      const issues = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new Error(`Validation error: ${JSON.stringify(issues)}`);
    }
    throw error;
  }
} 