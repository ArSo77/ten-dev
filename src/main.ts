import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import test functions for development
import * as testApi from './test-api'
import { initializeMessages } from './api/messages'
import { supabase } from './db/supabase.client'
import { apiHandler } from './middleware/api-handler'

// Register the API handler middleware
// This is needed to intercept and handle API requests in development mode
if (import.meta.env.DEV) {
  // Use the native fetch API to add our API middleware
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith('/api/')) {
      // Create a new Request object if input is a string
      const request = input instanceof Request ? input : new Request(input, init);
      return await apiHandler(request);
    }
    // Fall back to original fetch for non-API requests
    return originalFetch(input, init);
  };
  console.log('API middleware registered');
}

// Declare global namespace extension
declare global {
  interface Window {
    testApi: typeof testApi;
  }
}

// Make test functions available in global scope for browser console testing
window.testApi = testApi;

// Sprawdź, czy istnieje użytkownik "Arek", a jeśli nie - utwórz go
async function checkOrCreateArekUser() {
  // Sprawdź, czy istnieje użytkownik o nazwie "Arek"
  const { data: existingUsers, error: searchError } = await supabase
    .from('users')
    .select('id, nick')
    .eq('nick', 'Arek');
  
  if (searchError) {
    console.error('Błąd podczas sprawdzania użytkownika Arek:', searchError);
    return null;
  }
  
  // Jeśli znajdziemy użytkownika "Arek", zwróć jego dane
  if (existingUsers && existingUsers.length > 0) {
    console.log('Znaleziono użytkownika "Arek" z ID:', existingUsers[0].id);
    return existingUsers[0];
  }
  
  // Jeśli nie ma "Arka", utwórz go
  const newUserId = crypto.randomUUID();
  const newUser = {
    id: newUserId,
    nick: 'Arek',
    email: 'arek@example.com',
    roles: 'pilot'
  };
  
  const { error: insertError } = await supabase
    .from('users')
    .insert(newUser);
  
  if (insertError) {
    console.error('Błąd podczas tworzenia użytkownika Arek:', insertError);
    return null;
  }
  
  console.log('Utworzono nowego użytkownika "Arek" z ID:', newUserId);
  return { id: newUserId, nick: 'Arek' };
}

// Inicjalizacja przykładowych wiadomości w bazie danych przy starcie aplikacji
Promise.all([
  initializeMessages(),
  checkOrCreateArekUser()
]).then(([messagesSuccess, arekUser]) => {
  if (messagesSuccess) {
    console.log('Wiadomości w bazie danych zostały zainicjalizowane.');
    console.log('Aby zobaczyć różne wiadomości, wybierz konkretnego odbiorcę z listy rozwijanej.');
    console.log('Każdy użytkownik ma przypisany inny zestaw wiadomości.');
    
    if (arekUser) {
      console.log('=== SYMULACJA LOGOWANIA ===');
      console.log(`Jesteś zalogowany jako: Arek (ID: ${arekUser.id})`);
      console.log('Domyślnie wyświetlane są wiadomości adresowane do Ciebie (Arek).');
      console.log('Możesz wybrać innego odbiorcę z listy, aby zobaczyć wiadomości dla innych użytkowników.');
    }
  } else {
    console.warn('Nie udało się zainicjalizować wiadomości w bazie danych. Sprawdź konsolę po więcej szczegółów.');
  }
}).catch(error => {
  console.error('Błąd podczas inicjalizacji:', error);
});

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
