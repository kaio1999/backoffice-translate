import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importações do Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Ícones MDI para Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { VueQueryPlugin } from '@tanstack/vue-query';

// Definição do tema moderno e intuitivo
const customTheme = {
  dark: false, // Pode alternar para true para um tema escuro
  colors: {
    primary: '#4CAF50',    // Um verde vibrante para ações principais (ex: botões)
    secondary: '#607D8B',  // Um tom de cinza azulado para elementos secundários
    accent: '#FFC107',     // Um amarelo para destaques e avisos
    error: '#FF5252',      // Vermelho para erros
    info: '#2196F3',       // Azul para informações
    success: '#4CAF50',    // Verde para sucesso (igual ao primary, se desejar)
    warning: '#FB8C00',    // Laranja para alertas
    background: '#F5F5F5', // Um cinza claro para o fundo
    surface: '#FFFFFF',    // Branco para cards e superfícies
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    },
  },
  icons: {
    defaultSet: 'mdi', // Usa Material Design Icons
  },
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(VueQueryPlugin);
app.mount('#app')