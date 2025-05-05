import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import test functions for development
import * as testApi from './test-api'

// Declare global namespace extension
declare global {
  interface Window {
    testApi: typeof testApi;
  }
}

// Make test functions available in global scope for browser console testing
window.testApi = testApi;

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
