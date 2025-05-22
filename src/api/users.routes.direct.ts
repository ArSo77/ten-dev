import { UsersService } from './users.service';
import { createUserSchema } from './validation/users.schema';
import { supabase } from '../db/supabase.client';
import type { CreateUserCommand, UserDTO } from '../types';

/**
 * Direct test function for creating a user
 * Bypasses the router/express architecture and calls the service directly
 */
export async function createUserDirect(userData: CreateUserCommand): Promise<UserDTO> {
  console.log('Creating user directly via service:', userData);
  
  // Validate input data
  const parseResult = createUserSchema.safeParse(userData);
  if (!parseResult.success) {
    console.error('Validation error:', parseResult.error.format());
    throw new Error('Invalid input data');
  }
  
  // Create user service
  const usersService = new UsersService(supabase);
  
  // Create user
  const newUser = await usersService.createUser(parseResult.data);
  
  console.log('User created successfully:', newUser);
  return newUser;
} 