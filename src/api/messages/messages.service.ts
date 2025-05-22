import { supabase } from '../../db/supabase.client';
import type { CreateMessageCommand, MessageDTO } from '../../types';

export class MessagesService {
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
} 