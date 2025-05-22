<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Wiadomości</h1>
    
    <div class="mb-6 bg-gray-800 p-4 rounded border border-gray-700">
      <h2 class="text-lg font-semibold mb-2">Filtruj wiadomości</h2>
      
      <div class="flex items-center gap-4">
        <label class="flex items-center">
          <span class="mr-2">Pokaż wiadomości dla:</span>
          <select 
            v-model="selectedRecipientId" 
            class="bg-gray-700 border border-gray-600 rounded px-3 py-1.5"
            @change="handleRecipientChange"
          >
            <option :value="currentUser?.id">Moje wiadomości</option>
            <option value="">Wszystkie dostępne wiadomości</option>
            <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
              {{ user.nick }}
            </option>
          </select>
        </label>
        
        <button 
          @click="resetAndReload" 
          class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Resetuj i odśwież
        </button>
      </div>
    </div>
    
    <!-- Przyciski akcji -->
    <div class="mb-6 flex justify-end">
      <router-link 
        to="/send" 
        class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white flex items-center"
      >
        <span class="mr-1">+</span> Wyślij nową wiadomość
      </router-link>
    </div>
    
    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
    </div>
    
    <div v-else-if="errorMessage" class="p-4 border rounded bg-red-900 border-red-700 text-white">
      {{ errorMessage }}
    </div>
    
    <div v-else-if="messages.length === 0" class="text-center py-10 text-gray-400">
      Brak wiadomości dla wybranego odbiorcy
    </div>
    
    <div v-else class="grid grid-cols-1 gap-4">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="p-4 border rounded bg-gray-800 border-gray-700"
      >
        <div class="flex justify-between">
          <span class="font-bold">Od: {{ getSenderName(message.sender_id) }}</span>
          <span class="text-sm text-gray-400">{{ formatDate(message.sent_at) }}</span>
        </div>
        <p class="mt-2">{{ message.content }}</p>
      </div>
    </div>
    
    <!-- Pagination controls -->
    <div v-if="messages.length > 0" class="flex justify-between items-center mt-6">
      <div>
        <span class="text-sm text-gray-400">
          Pokazuję {{ messages.length }} z {{ totalMessages }} wiadomości
        </span>
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          class="px-3 py-1 border rounded disabled:opacity-50"
          :disabled="currentPage <= 1"
        >
          Poprzednia
        </button>
        <span class="px-3 py-1">Strona {{ currentPage }}</span>
        <button 
          @click="nextPage" 
          class="px-3 py-1 border rounded disabled:opacity-50"
          :disabled="!hasMorePages"
        >
          Następna
        </button>
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../db/supabase.client'
import type { MessageDTO } from '../types'
import { getMessages, getMessageUsers, initializeMessages } from '../api/messages'
import MessageGenerator from '../components/MessageGenerator.vue'

interface User {
  id: string;
  nick: string;
  email: string | null;
}

const messages = ref<MessageDTO[]>([])
const users = ref<Record<string, User>>({})
const availableUsers = ref<User[]>([])
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const totalMessages = ref(0)
const currentUser = ref<User | null>(null)

// Domyślnie filtrujemy po zalogowanym użytkowniku
const selectedRecipientId = ref('')

// Computed property to determine if there are more pages
const hasMorePages = computed(() => {
  return messages.value.length > 0 && (currentPage.value * pageSize.value) < totalMessages.value
})

// Computed property to filter out current user from available users
const filteredUsers = computed(() => {
  if (!currentUser.value) return availableUsers.value;
  return availableUsers.value.filter(user => user.id !== currentUser.value?.id);
})

// Function to generate UUID without using crypto.randomUUID()
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Debug status
const supabaseStatus = ref('Unknown');

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    supabaseStatus.value = 'Testing...';
    console.log('Testing Supabase connection...');
    
    // Try to fetch a list of users
    const { data, error } = await supabase
      .from('users')
      .select('id, nick')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      supabaseStatus.value = `Error: ${error.message}`;
      return;
    }
    
    console.log('Supabase connection test successful:', data);
    supabaseStatus.value = `Connected - Found ${data?.length || 0} users`;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    supabaseStatus.value = `Exception: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Znajdź lub utwórz użytkownika "Arek" (symulacja logowania)
async function setupCurrentUser() {
  try {
    // Sprawdź, czy istnieje użytkownik o nazwie "Arek"
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('id, nick, email')
      .eq('nick', 'Arek');
    
    if (searchError) {
      console.error('Error searching for user:', searchError);
      throw searchError;
    }
    
    // Jeśli znajdziemy użytkownika "Arek", użyj go jako zalogowanego
    if (existingUsers && existingUsers.length > 0) {
      currentUser.value = existingUsers[0];
      console.log('Znaleziono użytkownika "Arek":', currentUser.value);
      selectedRecipientId.value = currentUser.value.id;
      return;
    }
    
    // Jeśli nie ma "Arka", utwórz go
    const newUserId = generateUUID();
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
      console.error('Error creating user:', insertError);
      throw insertError;
    }
    
    // Ustaw nowego użytkownika jako zalogowanego
    currentUser.value = {
      id: newUserId,
      nick: 'Arek',
      email: 'arek@example.com'
    };
    console.log('Utworzono nowego użytkownika "Arek":', currentUser.value);
    selectedRecipientId.value = currentUser.value.id;
    
    // Dodaj nowego użytkownika jako odbiorcę dla istniejących wiadomości
    await addUserAsRecipient(newUserId);
    
  } catch (error) {
    console.error('Error setting up current user:', error);
    // Utwórz lokalnego użytkownika na potrzeby UI
    currentUser.value = {
      id: 'local-arek-id',
      nick: 'Arek (lokalnie)',
      email: null
    };
  }
}

// Dodaj użytkownika jako odbiorcę dla niektórych istniejących wiadomości
async function addUserAsRecipient(userId: string) {
  try {
    // Pobierz istniejące wiadomości
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .order('sent_at', { ascending: false })
      .limit(5);
    
    if (messagesError || !messages || messages.length === 0) {
      console.error('Error fetching messages or no messages found:', messagesError);
      return;
    }
    
    // Sprawdź, czy użytkownik już jest odbiorcą tych wiadomości
    const { data: existingRecipients, error: recipientsError } = await supabase
      .from('message_recipients')
      .select('message_id')
      .eq('recipient_id', userId);
    
    if (recipientsError) {
      console.error('Error checking existing recipients:', recipientsError);
      return;
    }
    
    // Filtruj wiadomości, dla których użytkownik nie jest jeszcze odbiorcą
    const existingMessageIds = new Set((existingRecipients || []).map(r => r.message_id));
    const messagesToAdd = messages.filter(m => !existingMessageIds.has(m.id));
    
    if (messagesToAdd.length === 0) {
      console.log('User is already a recipient of all recent messages');
      return;
    }
    
    // Dodaj użytkownika jako odbiorcę do tych wiadomości
    const messageRecipients = messagesToAdd.map(message => ({
      message_id: message.id,
      recipient_id: userId
    }));
    
    const { error: insertError } = await supabase
      .from('message_recipients')
      .insert(messageRecipients);
    
    if (insertError) {
      console.error('Error adding user as recipient:', insertError);
      return;
    }
    
    console.log(`Added user ${userId} as recipient to ${messageRecipients.length} messages`);
  } catch (error) {
    console.error('Error in addUserAsRecipient:', error);
  }
}

async function resetAndReload() {
  // Zawsze resetuj do widoku wiadomości zalogowanego użytkownika
  selectedRecipientId.value = currentUser.value?.id || '';
  currentPage.value = 1;
  
  // Reinicjalizacja wiadomości testowych
  loading.value = true;
  try {
    await initializeMessages(true); // Wymuszenie odświeżenia wiadomości
    if (currentUser.value?.id) {
      await addUserAsRecipient(currentUser.value.id);
    }
    await fetchMessages();
  } catch (error) {
    console.error('Error reinitializing messages:', error);
    errorMessage.value = 'Wystąpił błąd podczas resetowania wiadomości.';
  } finally {
    loading.value = false;
  }
}

// Format date for display
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    return dateString;
  }
}

// Get sender name based on ID
function getSenderName(senderId: string): string {
  // Najpierw szukaj w wiadomości z polem sender_nick
  const message = messages.value.find(m => m.sender_id === senderId);
  if (message?.sender_nick) {
    return message.sender_nick;
  }
  
  // Jeśli nie znaleziono, sprawdź w lokalnej mapie użytkowników
  return users.value[senderId]?.nick || 'Nieznany nadawca';
}

// Handle recipient selection change
function handleRecipientChange() {
  currentPage.value = 1; // Reset to first page
  fetchMessages();
}

// Navigate to previous page
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchMessages();
  }
}

// Navigate to next page
function nextPage() {
  if (hasMorePages.value) {
    currentPage.value++;
    fetchMessages();
  }
}

// Fetch available users for recipient filter
async function fetchAvailableUsers() {
  try {
    console.log('Fetching available users for filter...');
    const users = await getMessageUsers();
    availableUsers.value = users;
    console.log('Fetched available users:', users.length);
  } catch (error) {
    console.error('Error fetching available users:', error);
  }
}

// Fetch users from Supabase
async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nick, email');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    // Convert array to record for quick lookups
    if (data) {
      const usersRecord: Record<string, User> = {};
      data.forEach(user => {
        usersRecord[user.id] = user;
      });
      users.value = usersRecord;
      console.log('Fetched users:', Object.keys(usersRecord).length);
    }
  } catch (error) {
    console.error('Error in fetchUsers:', error);
  }
}

// Fetch messages from API
async function fetchMessages() {
  try {
    loading.value = true;
    errorMessage.value = '';
    
    // Prepare query parameters
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: 'sent_at:desc'
    };
    
    // Add recipient_id filter if selected
    if (selectedRecipientId.value) {
      params.recipient_id = selectedRecipientId.value;
    }
    
    // Call our API with logging
    console.log('Fetching messages from API with params:', params);
    const data = await getMessages(params);
    
    console.log('Messages data received:', data);
    
    messages.value = data.messages || [];
    totalMessages.value = data.total || 0;
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Wystąpił błąd podczas ładowania wiadomości. Spróbuj ponownie później.';
  } finally {
    loading.value = false;
  }
}

// Initialize component
onMounted(async () => {
  loading.value = true;
  try {
    // Test connection first
    await testSupabaseConnection();
    
    // Najpierw ustaw zalogowanego użytkownika
    await setupCurrentUser();
    
    // Pobierz użytkowników i wiadomości równolegle
    await Promise.all([
      fetchUsers(),
      fetchAvailableUsers()
    ]);
    
    // Domyślnie pokaż wiadomości dla zalogowanego użytkownika
    selectedRecipientId.value = currentUser.value?.id || '';
    await fetchMessages();
  } catch (error) {
    console.error('Error initializing component:', error);
    errorMessage.value = 'Wystąpił błąd podczas inicjalizacji komponentu. Spróbuj odświeżyć stronę.';
  } finally {
    loading.value = false;
  }
});
</script>