<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Wyślij nową wiadomość</h1>
    
    <!-- Formularz wysyłania wiadomości -->
    <div class="bg-gray-800 p-6 rounded border border-gray-700">
      <div class="grid grid-cols-1 gap-4">
        <!-- Wybór nadawcy -->
        <div>
          <label class="block mb-1">Nadawca:</label>
          <select 
            v-model="newMessage.senderId" 
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5"
          >
            <option :value="currentUser?.id">{{ currentUser?.nick || 'Ja' }}</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.nick }}
            </option>
          </select>
        </div>
        
        <!-- Wybór odbiorców -->
        <div>
          <label class="block mb-1">Odbiorcy:</label>
          <select 
            v-model="newMessage.recipientIds" 
            multiple
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 h-24"
          >
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.nick }}
            </option>
          </select>
          <small class="text-gray-400 text-xs mt-1 block">Przytrzymaj Ctrl (lub Cmd) aby wybrać wielu odbiorców</small>
        </div>
        
        <!-- Treść wiadomości -->
        <div>
          <label class="block mb-1">Treść wiadomości:</label>
          <textarea 
            v-model="newMessage.content" 
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 h-36"
            placeholder="Wpisz treść wiadomości..."
          ></textarea>
        </div>
        
        <!-- Przycisk wysyłania -->
        <div class="flex justify-end">
          <button 
            @click="sendMessage" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            :disabled="sendingMessage || !isMessageValid"
          >
            <span v-if="sendingMessage">Wysyłanie...</span>
            <span v-else>Wyślij wiadomość</span>
          </button>
        </div>

        <!-- Status wysyłania -->
        <div v-if="messageSendStatus" :class="[
          'p-3 rounded text-center', 
          messageSendStatus.success ? 'bg-green-800 text-white' : 'bg-red-800 text-white'
        ]">
          {{ messageSendStatus.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../db/supabase.client'
import { getMessageUsers } from '../api/messages'
import { useRouter } from 'vue-router'

interface User {
  id: string;
  nick: string;
  email: string | null;
}

const router = useRouter()
const availableUsers = ref<User[]>([])
const currentUser = ref<User | null>(null)
const sendingMessage = ref(false)
const messageSendStatus = ref<{ success: boolean, message: string } | null>(null)

// New message state
const newMessage = ref({
  senderId: '',
  recipientIds: [] as string[],
  content: ''
})

// Validate if the message is ready to be sent
const isMessageValid = computed(() => {
  return (
    newMessage.value.senderId && 
    newMessage.value.recipientIds.length > 0 && 
    newMessage.value.content.trim().length > 0
  )
})

// Function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Znajdź lub utwórz użytkownika "Arek" (symulacja logowania)
async function setupCurrentUser() {
  try {
    // Sprawdź, czy istnieje użytkownik o nazwie "Arek"
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('id, nick, email')
      .eq('nick', 'Arek')
    
    if (searchError) {
      console.error('Error searching for user:', searchError)
      throw searchError
    }
    
    // Jeśli znajdziemy użytkownika "Arek", użyj go jako zalogowanego
    if (existingUsers && existingUsers.length > 0) {
      currentUser.value = existingUsers[0]
      console.log('Znaleziono użytkownika "Arek":', currentUser.value)
      return
    }
    
    // Jeśli nie ma "Arka", utwórz go
    const newUserId = generateUUID()
    const newUser = {
      id: newUserId,
      nick: 'Arek',
      email: 'arek@example.com',
      roles: 'pilot'
    }
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(newUser)
    
    if (insertError) {
      console.error('Error creating user:', insertError)
      throw insertError
    }
    
    // Ustaw nowego użytkownika jako zalogowanego
    currentUser.value = {
      id: newUserId,
      nick: 'Arek',
      email: 'arek@example.com'
    }
    console.log('Utworzono nowego użytkownika "Arek":', currentUser.value)
    
  } catch (error) {
    console.error('Error setting up current user:', error)
    // Utwórz lokalnego użytkownika na potrzeby UI
    currentUser.value = {
      id: 'local-arek-id',
      nick: 'Arek (lokalnie)',
      email: null
    }
  }
}

// Fetch available users for recipient selection
async function fetchAvailableUsers() {
  try {
    console.log('Fetching available users...')
    const users = await getMessageUsers()
    availableUsers.value = users
    console.log('Fetched available users:', users.length)
  } catch (error) {
    console.error('Error fetching available users:', error)
  }
}

// Function to send a new message
async function sendMessage() {
  console.log('Sending message with data:', {
    isValid: isMessageValid.value,
    sender: newMessage.value.senderId, 
    recipients: newMessage.value.recipientIds,
    contentLength: newMessage.value.content.length
  })
  
  if (!isMessageValid.value) {
    console.error('Message validation failed', newMessage.value)
    return
  }
  
  sendingMessage.value = true
  messageSendStatus.value = null
  
  try {
    // Use API endpoint to send message
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: newMessage.value.content,
        sender_id: newMessage.value.senderId,
        recipient_ids: newMessage.value.recipientIds
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Błąd wysyłania wiadomości')
    }

    const result = await response.json()
    console.log('Message sent successfully:', result)
    
    // Reset form and show success message
    messageSendStatus.value = {
      success: true,
      message: `Wiadomość wysłana do ${newMessage.value.recipientIds.length} odbiorców`
    }
    
    // Clear form after successful send
    newMessage.value.content = ''
    newMessage.value.recipientIds = []
    
    // Optional: redirect to messages after short delay
    setTimeout(() => {
      router.push('/messages')
    }, 3000)
    
  } catch (error) {
    console.error('Error sending message:', error)
    messageSendStatus.value = {
      success: false,
      message: 'Wystąpił błąd podczas wysyłania wiadomości: ' + (error instanceof Error ? error.message : String(error))
    }
  } finally {
    sendingMessage.value = false
  }
}

// Initialize component
onMounted(async () => {
  // Najpierw ustaw zalogowanego użytkownika
  await setupCurrentUser()
  
  // Set default sender to current user
  newMessage.value.senderId = currentUser.value?.id || ''
  
  // Pobierz dostępnych użytkowników
  await fetchAvailableUsers()
})
</script> 