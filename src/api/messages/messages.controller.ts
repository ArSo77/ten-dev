// Client-side compatible message controller
import { MessagesService } from './messages.service';
import { createMessageSchema } from '../validation/messages.schema';
import type { CreateMessageCommand, MessageDTO } from '../../types';

export class MessagesController {
  private messagesService = new MessagesService();

  async createMessage(data: any): Promise<MessageDTO> {
    // Validate input data
    const validationResult = createMessageSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(`Invalid input: ${JSON.stringify(validationResult.error.format())}`);
    }

    const command = validationResult.data as CreateMessageCommand;

    // Create message - no auth check for now
    return await this.messagesService.createMessage(command);
  }
} 