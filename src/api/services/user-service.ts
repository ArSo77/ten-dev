import { supabase } from '../../db/supabase.client';
import type { UserDTO, PaginatedUsersDTO, CreateUserCommand } from '../../types';
import type { UserQueryParams } from '../validators/user-params';
import type { TablesInsert } from '../../db/database.types';

/**
 * Fetches users from the database with pagination and optional role filtering
 * @param params - Query parameters including role, page, and limit
 * @returns A paginated response of users
 */
export async function getUsers(params: UserQueryParams): Promise<PaginatedUsersDTO> {
  const { role, page, limit } = params;
  
  // Calculate range for pagination
  const from = (page - 1) * limit;
  const to = page * limit - 1;
  
  // Build query with pagination
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, to);
  
  // Apply role filter if provided
  if (role) {
    query = query.eq('roles', role);
  }
  
  // Execute query
  const { data, error, count } = await query;
  
  // Handle query errors
  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
  
  // Map database results to UserDTO objects
  const users: UserDTO[] = (data || []).map(user => ({
    id: user.id,
    nick: user.nick,
    email: user.email,
    roles: user.roles
  }));
  
  // Return paginated response
  return {
    users,
    page,
    limit,
    total: count || 0
  };
}

/**
 * Creates a new user (pilot account) in the database
 * @param userData - User data to create
 * @returns The created user
 */
export async function createUser(userData: CreateUserCommand): Promise<UserDTO> {
  // Check if user with this nick already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('nick', userData.nick)
    .single();
    
  if (existingUser) {
    throw new Error('User with this nick already exists');
  }
  
  // Generate UUID for the new user
  const id = crypto.randomUUID();
  
  // Create a properly typed insert object
  const insertData: TablesInsert<'users'> = {
    ...userData,
    id
  };
  
  // Create the user with the insert data
  const { data, error } = await supabase
    .from('users')
    .insert(insertData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
  
  // Map database result to UserDTO
  return {
    id: data.id,
    nick: data.nick,
    email: data.email,
    roles: data.roles
  };
} 