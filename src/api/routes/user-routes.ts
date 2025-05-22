import { listUsers, createUserController, deleteUserController } from '../controllers/user-controller';
import { handleApiError } from '../utils/error-handler';

/**
 * Handler for GET /users endpoint
 * Lists users with optional filtering and pagination
 */
export async function getUsersHandler(req: Request): Promise<Response> {
  try {
    // Parse query parameters from URL
    const url = new URL(req.url);
    const queryParams: Record<string, any> = {};
    
    // Convert URLSearchParams to plain object
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }
    
    // Call controller to get users
    const result = await listUsers(queryParams);
    
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
 * Handler for POST /users endpoint
 * Creates a new user (pilot account)
 */
export async function createUserHandler(req: Request): Promise<Response> {
  console.log('createUserHandler called with request:', req.method, req.url);
  try {
    // Parse request body
    const requestBody = await req.json();
    console.log('Request body parsed:', requestBody);

    // For simplicity, mock a race director user
    // In a real application, this would be retrieved from an authentication system
    const mockUser = {
      id: 'admin-id',
      nick: 'admin',
      email: 'admin@example.com',
      roles: 'race_director'
    };

    // Call controller to create user
    console.log('Calling controller with data', requestBody);
    const result = await createUserController(requestBody, mockUser);
    console.log('User created successfully:', result);
    
    // Return created response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle errors
    console.error('Error in createUserHandler:', error);
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
 * Handler for DELETE /users/{id} endpoint
 * Deletes a specific user by ID
 */
export async function deleteUserHandler(req: Request): Promise<Response> {
  try {
    // Extract user ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log(`Processing DELETE request for user: ${userId}`);
    
    // For simplicity, mock a race director user
    // In a real application, this would be retrieved from an authentication system
    const mockUser = {
      id: 'admin-id',
      nick: 'admin',
      email: 'admin@example.com',
      roles: 'race_director'
    };
    
    // Call controller to delete user
    await deleteUserController(userId, mockUser);
    
    // Return successful response with no content
    return new Response(null, {
      status: 204
    });
  } catch (error) {
    // Handle errors
    console.error('Error in deleteUserHandler:', error);
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