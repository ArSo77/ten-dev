import { validateUserParams } from '../validators/user-params';
import { getUsers, createUser } from '../services/user-service';
import type { PaginatedUsersDTO, UserDTO, CreateUserCommand } from '../../types';
import { createUserSchema, userIdSchema } from '../validation/users.schema';
import { deleteUser } from '../users';

/**
 * Controller for handling user listing requests
 * @param queryParams - Raw query parameters from the request
 * @returns Paginated list of users
 */
export async function listUsers(queryParams: Record<string, any>): Promise<PaginatedUsersDTO> {
  try {
    // Validate and parse query parameters
    const validatedParams = validateUserParams(queryParams);
    
    // Fetch users using the service
    return await getUsers(validatedParams);
  } catch (error) {
    // Log error for debugging
    console.error('Error in listUsers controller:', error);
    
    // Re-throw the error to be handled by the global error handler
    throw error;
  }
}

/**
 * Controller for handling user creation requests
 * @param userData - User data from the request body
 * @param requestUser - The authenticated user making the request
 * @returns Created user data
 * @throws Error if user is not authorized or validation fails
 */
export async function createUserController(requestBody: unknown, requestUser: any): Promise<UserDTO> {
  try {
    // Check if requestUser has race_director role
    if (!requestUser || !requestUser.roles || !requestUser.roles.includes('race_director')) {
      throw new Error('Unauthorized: Only race directors can create new pilots');
    }

    // Validate request data against schema
    const parseResult = createUserSchema.safeParse(requestBody);
    if (!parseResult.success) {
      throw new Error(`Invalid user data: ${parseResult.error.message}`);
    }

    // Create user with validated data
    return await createUser(parseResult.data as CreateUserCommand);
  } catch (error) {
    // Log error for debugging
    console.error('Error in createUser controller:', error);
    
    // Re-throw the error to be handled by the global error handler
    throw error;
  }
}

/**
 * Controller for handling user deletion requests
 * @param userId - User ID to delete
 * @param requestUser - The authenticated user making the request
 * @throws Error if user is not authorized or validation fails
 */
export async function deleteUserController(userId: string, requestUser: any): Promise<void> {
  try {
    // Check if requestUser has race_director role
    if (!requestUser || !requestUser.roles || !requestUser.roles.includes('race_director')) {
      throw new Error('Unauthorized: Only race directors can delete pilots');
    }

    // Validate user ID against schema
    const parseResult = userIdSchema.safeParse(userId);
    if (!parseResult.success) {
      throw new Error(`Invalid user ID: ${parseResult.error.message}`);
    }

    // Delete user with validated ID
    await deleteUser(userId);
  } catch (error) {
    // Log error for debugging
    console.error('Error in deleteUser controller:', error);
    
    // Re-throw the error to be handled by the global error handler
    throw error;
  }
} 