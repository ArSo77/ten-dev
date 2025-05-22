import { getMessagesHandler, getUsersForMessagesHandler, createMessageHandler } from '../api/routes/message-routes';
import { getUsersHandler, createUserHandler, deleteUserHandler } from '../api/routes/user-routes';

/**
 * Main API handler middleware for Vite dev server
 * This acts as the router for all API endpoints
 */
export async function apiHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  console.log(`API request: ${method} ${path}`);
  
  // Route definitions
  // Organize routes by HTTP method and path
  try {
    // GET routes
    if (method === 'GET') {
      // GET /api/messages - List messages for a pilot
      if (path === '/api/messages') {
        return await getMessagesHandler(req);
      }
      
      // GET /api/users - List users/pilots
      if (path === '/api/users') {
        return await getUsersHandler(req);
      }
      
      // GET /api/messages/users - Get users for message recipients
      if (path === '/api/messages/users') {
        return await getUsersForMessagesHandler(req);
      }
    }
    
    // POST routes
    if (method === 'POST') {
      // POST /api/users - Create a user
      if (path === '/api/users') {
        return await createUserHandler(req);
      }
      
      // POST /api/messages - Create a message
      if (path === '/api/messages') {
        return await createMessageHandler(req);
      }
    }
    
    // DELETE routes
    if (method === 'DELETE') {
      // DELETE /api/users/{id} - Delete a user
      if (path.match(/^\/api\/users\/[a-zA-Z0-9-]+$/)) {
        return await deleteUserHandler(req);
      }
    }
    
    // Route not found
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unhandled API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 