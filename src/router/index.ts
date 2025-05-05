import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { apiHandler } from '../api';
import UsersView from '../views/UsersView.vue';
import MessagesView from '../views/MessagesView.vue';

// Sprawdzamy czy jesteśmy w trybie developerskim
const isDev = import.meta.env.DEV;

// API middleware dla serwera Vite - będzie zainicjowane po załadowaniu modułu
if (typeof window !== 'undefined') {
  // Upewniamy się, że wykonujemy to w środowisku przeglądarki
  window.addEventListener('load', () => {
    if (isDev) {
      // Tylko w trybie developerskim
      const originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        const url = input instanceof Request ? input.url : input.toString();
        
        console.log('Fetch interceptor: URL =', url);
        
        // Jeśli to zapytanie API do naszej aplikacji
        if (url.includes('/api/') && url.startsWith(window.location.origin)) {
          console.log('API middleware intercepting request to:', url, 'method:', init?.method || (input instanceof Request ? input.method : 'GET'));
          
          // Tworzymy obiekt Request
          const request = input instanceof Request ? input : new Request(url, init);
          
          try {
            // Wywołujemy nasz handler API
            console.log('Calling API handler with request:', request.method, request.url);
            const response = await apiHandler(request);
            console.log('API middleware response status:', response.status);
            return response;
          } catch (error) {
            console.error('API middleware error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
        }
        
        // W przeciwnym razie używamy oryginalnego fetch
        return originalFetch.apply(this, [input, init]);
      };
      console.log('API middleware installed successfully');
    }
  });
}

// Konfiguracja tras
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    // Note: We don't need the API route with the middleware approach
  ],
})

export default router
