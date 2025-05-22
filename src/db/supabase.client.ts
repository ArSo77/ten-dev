/// <reference types="node" />
// Upewnij się, że zainstalowałeś @types/node (npm i --save-dev @types/node) oraz @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Pobieranie zmiennych środowiskowych do konfiguracji Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string;

// Utworzenie klienta Supabase z typowaniem
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY); 