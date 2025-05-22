// Client-side API implementation
import { MessagesController } from './messages.controller';
import type { CreateMessageCommand, MessageDTO } from '../../types';

class MessagesAPI {
  private controller = new MessagesController();

  async createMessage(data: CreateMessageCommand): Promise<MessageDTO> {
    try {
      return await this.controller.createMessage(data);
    } catch (error) {
      console.error('Error in message API:', error);
      throw error;
    }
  }
}

export const messagesAPI = new MessagesAPI(); 