import { MessagesService } from '../services/messages.service';
import { createMessageSchema } from '../validation/messages.schema';
import { supabase } from '../../db/supabase.client';
import type { CreateMessageCommand, MessageDTO } from '../../types';

// Create an instance of the messages service
const messagesService = new MessagesService();

/**
 * Controller for creating a new message
 * Validates input data and calls the messages service
 * @param data - Message data from the request
 * @param user - Authenticated user making the request (should be a race director)
 * @returns Created message DTO or error
 */
export async function createMessageController(
  data: any,
  user: { id: string; roles: string }
): Promise<MessageDTO> {
  try {
    // Validate input data
    const validationResult = createMessageSchema.safeParse(data);
    
    if (!validationResult.success) {
      // Handle validation errors
      const errorMessage = validationResult.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      throw new Error(`Invalid input data: ${errorMessage}`);
    }
    
    // Get validated data
    const command = validationResult.data as CreateMessageCommand;
    
    // Check if sender is a race director
    if (!user.roles.includes('race_director')) {
      throw new Error('Only race directors can send messages');
    }
    
    // Verify that all recipients exist
    const { data: recipients, error: recipientsError } = await supabase
      .from('users')
      .select('id')
      .in('id', command.recipient_ids);
    
    if (recipientsError) {
      throw new Error(`Error verifying recipients: ${recipientsError.message}`);
    }
    
    if (!recipients || recipients.length !== command.recipient_ids.length) {
      throw new Error('One or more recipient IDs are invalid');
    }
    
    // Call service to create the message
    return await messagesService.createMessage(command);
  } catch (error) {
    // Re-throw error to be handled by the API handler
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
} 