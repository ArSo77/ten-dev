import { createUser, getUsers } from './api/users';
import { getMessages, getMessageUsers } from './api/messages';
import { supabase } from './db/supabase.client';

/**
 * Test function to directly create a user using the browser API
 */
async function testCreateUser() {
  try {
    console.log('Starting direct user creation test...');
    
    // Test data
    const testUser = {
      nick: 'testpilot' + Math.floor(Math.random() * 1000), // Add random suffix to avoid duplicates
      email: 'test@example.com',
      roles: 'pilot'
    };
    
    console.log('Creating user with data:', testUser);
    
    // Use the browser API to create the user
    const result = await createUser(testUser);
    
    console.log('User created successfully!');
    console.log('User details:', result);
    console.log('UUID generated:', result.id);
    
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Test function to get users using the browser API
 */
async function testGetUsers() {
  try {
    console.log('Getting users...');
    const result = await getUsers({ page: 1, limit: 10 });
    console.log('Users retrieved:', result);
    console.log('Number of users:', result.users.length);
    return result;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

/**
 * Test function to get messages for a user
 */
async function testGetMessages(params = {}) {
  try {
    console.log('Getting messages with params:', params);
    const result = await getMessages({
      page: 1,
      limit: 5,
      sort: 'sent_at:desc',
      ...params
    });
    
    console.log('Messages retrieved:', result);
    return result;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Test function to get available users for message filtering
 */
async function testGetMessageUsers() {
  try {
    console.log('Getting users for messages...');
    const result = await getMessageUsers();
    console.log('Users for messages retrieved:', result);
    return result;
  } catch (error) {
    console.error('Error getting users for messages:', error);
    throw error;
  }
}

/**
 * Test function to create a new message
 */
export async function testCreateMessage() {
  try {
    interface User {
      id: string;
      nick: string;
      roles: string;
      email?: string | null;
    }
    
    // Get available users for sender and recipients
    const { data: users, error } = await supabase
      .from('users')
      .select('id, nick, roles, email');
    
    if (error || !users || users.length < 2) {
      console.error('Error fetching users or not enough users:', error);
      return null;
    }
    
    // Find a race director user (for testing, create one if not found)
    let raceDirector: User | undefined = users.find((u: User) => u.roles.includes('race_director'));
    if (!raceDirector) {
      // Use the first user as a race director or create a new one
      const directorId = crypto.randomUUID();
      raceDirector = {
        id: directorId,
        nick: 'Test Director',
        email: 'director@example.com',
        roles: 'race_director'
      };
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(raceDirector);
      
      if (insertError) {
        console.error('Error creating race director:', insertError);
        return null;
      }
      
      console.log('Created a test race director:', raceDirector);
    }
    
    // Find pilots (non-race directors)
    const pilots = users.filter((u: User) => u.id !== raceDirector.id).slice(0, 2);
    if (pilots.length === 0) {
      console.error('No pilots found to send message to');
      return null;
    }
    
    // Create a test message
    const messageData = {
      content: `Test message sent at ${new Date().toLocaleTimeString()}`,
      sender_id: raceDirector.id,
      recipient_ids: pilots.map((p: User) => p.id)
    };
    
    console.log('Sending test message:', messageData);
    
    // Use fetch API to test the POST /messages endpoint
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    // Parse and log the response
    const result = await response.json();
    console.log('Message creation result:', result);
    console.log('Response status:', response.status);
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error('Error in testCreateMessage:', error);
    return { error };
  }
}

/**
 * Test function to delete a user via the API
 */
async function testDeleteUser(userId: string) {
  try {
    if (!userId) {
      console.error('User ID is required');
      return { error: 'User ID is required' };
    }
    
    console.log(`Deleting user with ID: ${userId}`);
    
    // Use fetch API to test the DELETE /users/{id} endpoint
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    
    // Check if the response is successful (204 No Content)
    if (response.status === 204) {
      console.log('User deleted successfully');
      return { success: true, status: response.status };
    }
    
    // If there's an error, parse and return it
    const result = await response.json().catch(() => null);
    console.error('Error deleting user:', result);
    return { 
      success: false, 
      status: response.status, 
      error: result?.error || 'Unknown error' 
    };
  } catch (error) {
    console.error('Error in testDeleteUser:', error);
    return { error };
  }
}

// Export the test functions so they can be called from the browser console
(window as any).testCreateUser = testCreateUser;
(window as any).testGetUsers = testGetUsers;
(window as any).testGetMessages = testGetMessages;
(window as any).testGetMessageUsers = testGetMessageUsers;
(window as any).testCreateMessage = testCreateMessage;
(window as any).testDeleteUser = testDeleteUser; 