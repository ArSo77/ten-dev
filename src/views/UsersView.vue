<template>
  <div class="users-container">
    <div class="flex justify-between items-center mb-4">
      <h1>Lista Użytkowników</h1>
      <button 
        @click="showAddForm = !showAddForm" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {{ showAddForm ? 'Anuluj' : 'Dodaj użytkownika' }}
      </button>
    </div>

    <!-- Formularz dodawania użytkownika -->
    <div v-if="showAddForm" class="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
      <h2 class="text-lg font-medium mb-3 text-gray-100">Nowy użytkownik</h2>
      <form @submit.prevent="addUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-200">Nick</label>
          <input 
            v-model="newUser.nick" 
            type="text" 
            required 
            class="mt-1 block w-full p-2 border bg-gray-700 border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-200">Email</label>
          <input 
            v-model="newUser.email" 
            type="email" 
            class="mt-1 block w-full p-2 border bg-gray-700 border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-200">Rola</label>
          <div class="mt-1 flex items-center space-x-4">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="newUser.roles" 
                value="pilot" 
                class="form-radio h-4 w-4 text-blue-600"
              />
              <span class="ml-2 text-sm text-gray-200">Pilot</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="newUser.roles" 
                value="race_director" 
                class="form-radio h-4 w-4 text-blue-600"
              />
              <span class="ml-2 text-sm text-gray-200">Race Director</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button 
            type="button" 
            @click="showAddForm = false" 
            class="px-4 py-2 border border-gray-600 rounded disabled:opacity-50 bg-gray-800 text-gray-300"
          >
            Anuluj
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :disabled="addingUser"
          >
            {{ addingUser ? 'Dodawanie...' : 'Dodaj' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Komunikat o powodzeniu -->
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <p>{{ successMessage }}</p>
    </div>

    <!-- Tabela użytkowników -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-700">
        <thead class="bg-gray-800">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nick</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rola</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Akcje</th>
          </tr>
        </thead>
        <tbody class="bg-gray-800 divide-y divide-gray-700">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">-{{ user.id.slice(-3) }}-</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{{ user.nick }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded-full', 
                  user.roles === 'race_director' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ user.roles === 'race_director' ? 'Race Director' : 'Pilot' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              <button 
                @click="removeUser(user)" 
                class="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                title="Usuń użytkownika"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Usuń
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center my-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    
    <!-- Błąd -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
      <p>{{ error }}</p>
    </div>

    <!-- Paginacja -->
    <div class="pagination-container flex justify-between items-center mt-4">
      <div>
        <span class="text-sm text-gray-300">
          Strona {{ page }} z {{ totalPages }}
        </span>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="prevPage" 
          :disabled="page <= 1" 
          class="px-4 py-2 border border-gray-600 rounded disabled:opacity-50 bg-gray-800 text-gray-300"
          :class="{ 'bg-gray-700': page <= 1 }"
        >
          Poprzednia
        </button>
        <button 
          @click="nextPage" 
          :disabled="page >= totalPages" 
          class="px-4 py-2 border border-gray-600 rounded disabled:opacity-50 bg-gray-800 text-gray-300"
          :class="{ 'bg-gray-700': page >= totalPages }"
        >
          Następna
        </button>
      </div>
      <div>
        <select v-model="limit" @change="fetchUsers" class="p-2 border border-gray-600 rounded bg-gray-800 text-gray-300">
          <option :value="10">10 na stronę</option>
          <option :value="20">20 na stronę</option>
          <option :value="50">50 na stronę</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { UserDTO } from '../types';
import { getUsers, createUser, deleteUser } from '../api/users';

// Stan komponentu
const users = ref<UserDTO[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const showAddForm = ref(false);
const addingUser = ref(false);
const successMessage = ref<string | null>(null);

// Stan nowego użytkownika
const newUser = ref({
  nick: '',
  email: null as string | null,
  roles: 'pilot' as 'pilot' | 'race_director'
});

// Obliczenie całkowitej liczby stron
const totalPages = computed(() => Math.ceil(total.value / limit.value) || 1);

// Funkcja do dodawania nowego użytkownika
async function addUser() {
  addingUser.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    const userData = {
      nick: newUser.value.nick,
      email: newUser.value.email,
      roles: newUser.value.roles
    };
    
    const createdUser = await createUser(userData);
    
    // Dodanie nowego użytkownika do listy jeśli jest na aktualnej stronie
    if (page.value === 1) {
      users.value = [createdUser, ...users.value];
    }
    
    // Odświeżenie listy użytkowników
    fetchUsers();
    
    // Wyczyszczenie formularza
    newUser.value.nick = '';
    newUser.value.email = null;
    newUser.value.roles = 'pilot';
    
    // Ukrycie formularza
    showAddForm.value = false;
    
    // Wyświetlenie komunikatu o powodzeniu
    successMessage.value = `Użytkownik ${createdUser.nick} został pomyślnie utworzony!`;
    
    // Ukryj komunikat po 3 sekundach
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
    
  } catch (err) {
    console.error('Error creating user:', err);
    if (err instanceof Error) {
      error.value = `Błąd podczas tworzenia użytkownika: ${err.message}`;
    } else {
      error.value = 'Wystąpił nieznany błąd podczas tworzenia użytkownika';
    }
  } finally {
    addingUser.value = false;
  }
}

// Funkcja do pobierania użytkowników przez API
async function fetchUsers() {
  loading.value = true;
  error.value = null;
  
  try {
    // Użycie serwisu API do pobrania danych
    const response = await getUsers({
      page: page.value,
      limit: limit.value
    });
    
    users.value = response.users;
    total.value = response.total;
    
  } catch (err) {
    console.error('Error fetching users:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Wystąpił nieznany błąd';
    }
    
    // Reset users array in case of error
    users.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// Funkcje nawigacji paginacji
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchUsers();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchUsers();
  }
}

// Funkcja do usuwania użytkownika
async function removeUser(user: UserDTO) {
  loading.value = true;
  error.value = null;
  
  try {
    await deleteUser(user.id);
    
    // Usunięcie użytkownika z listy
    users.value = users.value.filter(u => u.id !== user.id);
    
    // Aktualizacja całkowitej liczby użytkowników
    total.value -= 1;
    
    // Odświeżenie listy jeśli bieżąca strona jest pusta
    if (users.value.length === 0 && page.value > 1) {
      page.value -= 1;
      fetchUsers();
    }
    
    // Wyświetlenie komunikatu o powodzeniu
    successMessage.value = `Użytkownik ${user.nick} został pomyślnie usunięty!`;
    
    // Ukryj komunikat po 3 sekundach
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
    
  } catch (err) {
    console.error('Error deleting user:', err);
    if (err instanceof Error) {
      error.value = `Błąd podczas usuwania użytkownika: ${err.message}`;
    } else {
      error.value = 'Wystąpił nieznany błąd podczas usuwania użytkownika';
    }
  } finally {
    loading.value = false;
  }
}

// Pobierz użytkowników przy montowaniu komponentu
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style> 