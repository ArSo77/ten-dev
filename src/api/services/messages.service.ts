import { supabase } from '../../db/supabase.client';
import type { MessageDTO, PaginatedMessagesDTO, CreateMessageCommand } from '../../types';
import type { MessagesQueryParamsType } from '../validation/messages.schema';

/**
 * Service for handling message-related operations
 */
export class MessagesService {
  /**
   * Creates a new message and its recipient associations
   * @param command - Command containing message data and recipient IDs
   * @returns Created message with its metadata
   */
  async createMessage(command: CreateMessageCommand): Promise<MessageDTO> {
    // Generate a UUID for the new message
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Start transaction by creating the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        content: command.content,
        sender_id: command.sender_id,
        sent_at: now
      })
      .select()
      .single();

    if (messageError) {
      throw new Error(`Error creating message: ${messageError.message}`);
    }

    // Create recipient entries
    const recipientEntries = command.recipient_ids.map(recipient_id => ({
      message_id: message.id,
      recipient_id
    }));

    const { error: recipientsError } = await supabase
      .from('message_recipients')
      .insert(recipientEntries);

    if (recipientsError) {
      // If error occurs, try to delete the created message
      await supabase.from('messages').delete().eq('id', message.id);
      throw new Error(`Error assigning recipients: ${recipientsError.message}`);
    }

    // Return full DTO with recipients list
    return {
      ...message,
      recipients: command.recipient_ids
    };
  }
  
  /**
   * Retrieves messages for a specific user with pagination and sorting
   * @param userId - ID of the user to retrieve messages for
   * @param params - Query parameters for pagination and sorting
   * @param recipientIdFilter - Optional ID of the recipient to filter messages by
   * @returns Paginated messages with metadata
   */
  async listMessagesForUser(
    userId: string,
    params: MessagesQueryParamsType,
    recipientIdFilter?: string
  ): Promise<PaginatedMessagesDTO> {
    const { limit, page, sort } = params;
    const offset = (page - 1) * limit;
    
    // Parse sorting parameter
    const [sortField, sortOrder] = sort?.split(':') || ['sent_at', 'desc'];
    
    console.log(`Fetching messages for user ${userId} with params:`, params);
    if (recipientIdFilter) {
      console.log(`Filtering by recipient ID: ${recipientIdFilter}`);
    }
    
    try {
      // Query to get messages for the user with pagination
      const query = supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          sent_at,
          message_recipients!inner(recipient_id)
        `, { count: 'exact' });
      
      // Filter by recipient ID if specified
      if (recipientIdFilter) {
        query.eq('message_recipients.recipient_id', recipientIdFilter);
      }
      
      // Add sorting and pagination
      const { data: messages, error, count } = await query
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
      }
      
      // Transform data to match the DTO format
      const messagesDTO: MessageDTO[] = messages.map(message => ({
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sent_at: message.sent_at
      }));
      
      // Return formatted response with pagination info
      return {
        messages: messagesDTO,
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      // Re-throw error to be handled by the API handler
      console.error('Error in listMessagesForUser:', error);
      throw error;
    }
  }
  
  /**
   * Pobiera wszystkich dostępnych użytkowników z bazy
   * @returns Lista użytkowników
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nick, email');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }
} 