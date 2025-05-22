import { supabase } from '../../db/supabase.client';
import type { UserDTO } from '../../types';

/**
 * Client-side authentication utilities
 */
export class AuthService {
  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<UserDTO | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      return {
        id: user.id,
        nick: user.user_metadata?.nick || 'Unknown',
        email: user.email || null,
        roles: user.user_metadata?.roles || ''
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
  
  /**
   * Check if the user has a specific role
   */
  async hasRole(role: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    return user.roles.includes(role);
  }
}

export const authService = new AuthService(); 