import type { Database } from '../db/database.types';
import type { CreateUserCommand, UserDTO } from '../types';

// Using the correct SupabaseClient type based on the project rules
export type SupabaseClient = ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;

export class UsersService {
  constructor(private supabase: SupabaseClient) {}
  
  /**
   * Creates a new user (pilot account)
   * @param command User creation data
   * @returns Created user data
   * @throws Error if user with the same nick already exists or on database errors
   */
  async createUser(command: CreateUserCommand): Promise<UserDTO> {
    // Check for nick uniqueness
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('nick', command.nick)
      .single();
      
    if (existingUser) {
      throw new Error('User with this nick already exists');
    }
    
    // Generate UUID for the new user
    const id = crypto.randomUUID();
    
    // Create the user with generated ID
    const { data, error } = await this.supabase
      .from('users')
      .insert({ ...command, id })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as UserDTO;
  }

  /**
   * Deletes a user account with all related data
   * @param userId User ID to delete
   * @throws Error if user does not exist or on database errors
   */
  async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const { data: existingUser, error: userCheckError } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userCheckError || !existingUser) {
      throw new Error('User not found');
    }
    
    // Use transaction-like approach to delete related data
    
    // 1. Delete message recipients records
    const { error: recipientsDeleteError } = await this.supabase
      .from('message_recipients')
      .delete()
      .eq('recipient_id', userId);
      
    if (recipientsDeleteError) {
      console.error('Error deleting message recipients:', recipientsDeleteError);
      throw new Error('Failed to delete user data');
    }
    
    // 2. Delete messages sent by the user
    const { error: messagesDeleteError } = await this.supabase
      .from('messages')
      .delete()
      .eq('sender_id', userId);
      
    if (messagesDeleteError) {
      console.error('Error deleting messages:', messagesDeleteError);
      throw new Error('Failed to delete user data');
    }
    
    // 3. Delete the user
    const { error: userDeleteError } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);
      
    if (userDeleteError) {
      console.error('Error deleting user:', userDeleteError);
      throw new Error('Failed to delete user');
    }
  }
} 