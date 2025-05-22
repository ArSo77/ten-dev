import { MessagesService } from '../services/messages.service';
import { messagesQueryParamsSchema } from '../validation/messages.schema';
import type { PaginatedMessagesDTO } from '../../types';

// Create an instance of the messages service
const messagesService = new MessagesService();

/**
 * Controller for handling messages listing
 * Validates query parameters and calls the messages service
 * @param params - Raw query parameters from the request
 * @param userId - ID of the authenticated user
 * @returns Paginated list of messages or error
 */
export async function listMessagesController(
  params: Record<string, string>,
  userId: string
): Promise<PaginatedMessagesDTO> {
  try {
    // Validate and transform query parameters
    const validationResult = messagesQueryParamsSchema.safeParse(params);
    
    if (!validationResult.success) {
      // Handle validation errors
      const errorMessage = validationResult.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      throw new Error(`Invalid query parameters: ${errorMessage}`);
    }
    
    // Get validated parameters
    const validParams = validationResult.data;
    
    // Extract optional recipient_id filter
    const { recipient_id, ...paginationParams } = validParams;
    
    // Call service to fetch messages
    return await messagesService.listMessagesForUser(userId, paginationParams, recipient_id);
  } catch (error) {
    // Re-throw error to be handled by the API handler
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Controller for fetching all available users
 * @returns List of users or error
 */
export async function listAllUsersController() {
  try {
    return await messagesService.getAllUsers();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching users');
  }
} 