import { supabase } from '../db/supabase.client';
import type { UserDTO, PaginatedUsersDTO, CreateUserCommand } from '../types';
import { z } from 'zod';

// Schemat walidacji dla parametrów 
const paramsSchema = z.object({
  role: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(10)
});

// Schemat walidacji dla tworzenia użytkownika
const createUserSchema = z.object({
  nick: z.string().min(1).max(50),
  email: z.string().email().nullable(),
  roles: z.enum(['pilot', 'race_director'])
});

export type UsersQueryParams = z.infer<typeof paramsSchema>;

/**
 * Serwis do pobierania listy użytkowników z Supabase
 * Obsługuje paginację i filtrowanie według roli
 */
export async function getUsers(params: UsersQueryParams): Promise<PaginatedUsersDTO> {
  // Walidacja parametrów zapytania
  const { role, page, limit } = paramsSchema.parse(params);
  
  // Przygotowanie zapytania do bazy danych z paginacją
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1);

  // Dodanie filtru po roli, jeśli podano parametr role
  if (role) {
    query = query.eq('roles', role);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`Błąd podczas pobierania użytkowników: ${error.message}`);
  }

  // Mapowanie danych do UserDTO
  const users: UserDTO[] = (data || []).map((user: any) => ({
    id: user.id,
    nick: user.nick,
    email: user.email,
    roles: user.roles
  }));

  // Przygotowanie odpowiedzi zgodnie z PaginatedUsersDTO
  return {
    users,
    page,
    limit,
    total: count ?? 0
  };
}

/**
 * Serwis do tworzenia nowego użytkownika (konta pilota)
 * @param userData - Dane nowego użytkownika
 * @returns Utworzony użytkownik z wygenerowanym identyfikatorem UUID
 */
export async function createUser(userData: CreateUserCommand): Promise<UserDTO> {
  // Walidacja danych użytkownika
  const validatedData = createUserSchema.parse(userData);
  
  // Sprawdzenie czy nick jest unikalny
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('nick', validatedData.nick)
    .single();
    
  if (existingUser) {
    throw new Error('Użytkownik o podanym nicku już istnieje');
  }
  
  // Generowanie UUID dla nowego użytkownika
  const id = crypto.randomUUID();
  
  // Tworzenie użytkownika w bazie danych
  const { data, error } = await supabase
    .from('users')
    .insert({ ...validatedData, id })
    .select()
    .single();
    
  if (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
    throw new Error(`Nie udało się utworzyć użytkownika: ${error.message}`);
  }
  
  // Zwrócenie utworzonego użytkownika
  return {
    id: data.id,
    nick: data.nick,
    email: data.email,
    roles: data.roles
  };
}

/**
 * Serwis do usuwania użytkownika
 * @param userId - Identyfikator użytkownika do usunięcia
 */
export async function deleteUser(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('ID użytkownika jest wymagane');
  }
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
    
  if (error) {
    console.error('Błąd podczas usuwania użytkownika:', error);
    throw new Error(`Nie udało się usunąć użytkownika: ${error.message}`);
  }
} 