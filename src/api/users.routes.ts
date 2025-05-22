import { UsersService } from './users.service';
import { createUserSchema, userIdSchema } from './validation/users.schema';
import { supabase } from '../db/supabase.client';
import type { CreateUserCommand, UserDTO } from '../types';

/**
 * Client-side compatible Users API
 * Note: Currently operating without authentication checks
 */
class UsersAPI {
  private usersService = new UsersService(supabase);

  /**
   * Creates a new user (pilot account)
   */
  async createUser(data: CreateUserCommand): Promise<UserDTO> {
    try {
      // Validate input data
      const parseResult = createUserSchema.safeParse(data);
      if (!parseResult.success) {
        throw new Error(`Invalid input data: ${JSON.stringify(parseResult.error.format())}`);
      }
      
      // Create user - no auth check for now
      return await this.usersService.createUser(parseResult.data);
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Deletes a user account and related data
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Validate userId parameter
      const parseResult = userIdSchema.safeParse(userId);
      if (!parseResult.success) {
        throw new Error(`Invalid user ID format: ${JSON.stringify(parseResult.error.format())}`);
      }
      
      // Delete the user - no auth check for now
      await this.usersService.deleteUser(userId);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const usersAPI = new UsersAPI(); 