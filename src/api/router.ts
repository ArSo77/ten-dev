// Client-side API router
import { messagesAPI } from './messages/messages.routes';
import { usersAPI } from './users.routes';

// Export all API endpoints for client-side use
export const api = {
  messages: messagesAPI,
  users: usersAPI
}; 