import { listMessagesController, listAllUsersController } from '../controllers/messages.controller';
import { createMessageController } from '../controllers/message-controller';
import { handleApiError } from '../utils/error-handler';

/**
 * Handler for GET /messages endpoint
 * Lists messages for the authenticated user with pagination and sorting
 */
export async function getMessagesHandler(req: Request): Promise<Response> {
  try {
    // Autoryzacja jest obecnie wyłączona
    // For testing, we'll mock a pilot user
    const mockUserId = 'pilot-id-123';
    
    // Parse query parameters from URL
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    
    // Convert URLSearchParams to plain object
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }
    
    console.log('Query params:', queryParams);
    
    // Call controller to get messages
    const result = await listMessagesController(queryParams, mockUserId);
    
    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle errors
    const errorResponse = handleApiError(error);
    
    // Return error response
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Handler for GET /users endpoint
 * Returns list of all users for UI selection
 */
export async function getUsersForMessagesHandler(req: Request): Promise<Response> {
  try {
    // Autoryzacja jest obecnie wyłączona
    
    // Call controller to get all users
    const users = await listAllUsersController();
    
    // Return successful response
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle errors
    const errorResponse = handleApiError(error);
    
    // Return error response
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Handler for POST /messages endpoint
 * Creates a new message from a race director to one or more pilots
 */
export async function createMessageHandler(req: Request): Promise<Response> {
  try {
    // Parse request body
    const requestBody = await req.json();
    
    // Authentication is currently disabled
    // For testing, we'll mock a race director user
    const mockUser = {
      id: 'race-director-id-123',
      nick: 'admin',
      email: 'admin@example.com',
      roles: 'race_director'
    };
    
    // Call controller to create message
    const result = await createMessageController(requestBody, mockUser);
    
    // Return created response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle errors
    const errorResponse = handleApiError(error);
    
    // Return error response
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 