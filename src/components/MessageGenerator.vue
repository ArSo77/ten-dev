<template>
  <div class="message-generator">
    <button 
      @click="generateMessages" 
      :disabled="isLoading" 
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
    >
      <span v-if="isLoading">Generowanie wiadomości...</span>
      <span v-else>Generuj wiadomości dla użytkowników</span>
    </button>
    
    <p v-if="message" class="mt-2 p-2" :class="{'text-green-600 bg-green-100': success, 'text-red-600 bg-red-100': !success}">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);
const message = ref('');
const success = ref(false);

const generateMessages = async () => {
  isLoading.value = true;
  message.value = '';
  success.value = false;
  
  try {
    const response = await fetch('/api/messages/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      success.value = true;
      message.value = data.message || 'Pomyślnie wygenerowano wiadomości dla wszystkich użytkowników!';
    } else {
      success.value = false;
      message.value = data.error || 'Wystąpił błąd podczas generowania wiadomości';
    }
  } catch (error) {
    success.value = false;
    message.value = 'Wystąpił błąd podczas komunikacji z serwerem';
    console.error('Error generating messages:', error);
  } finally {
    isLoading.value = false;
  }
};
</script> 