<template>
    <v-app>
        <v-main class="d-flex align-center justify-center bg-primary"> <v-card width="450"
                class="pa-7 rounded-lg elevation-12"> <v-card-title class="text-h4 text-center font-weight-bold mb-4">
                    Bem-vindo ao i18n Manager
                </v-card-title>
                <v-card-subtitle class="text-center mb-6">
                    Acesse sua conta para gerenciar suas traduções.
                </v-card-subtitle>
                <v-card-text>
                    <v-text-field label="E-mail ou Usuário" v-model="username" prepend-inner-icon="mdi-account-circle"
                        outlined dense color="primary" class="mb-4"></v-text-field>
                    <v-text-field label="Senha" v-model="password" type="password" prepend-inner-icon="mdi-lock"
                        outlined dense color="primary" class="mb-6"></v-text-field>
                    <v-btn color="primary" size="large" block @click="handleLogin" :loading="loading">
                        Entrar
                    </v-btn>
                    <v-alert v-if="error" type="error" dense text class="mt-4">
                        {{ error }}
                    </v-alert>
                </v-card-text>
            </v-card>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/auth-service';
import { useMutation } from '@tanstack/vue-query';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

const mutation = useMutation({
  mutationFn: login, // Agora apontamos para a função importada do serviço
  onSuccess: (data) => {
    console.log('Login bem-sucedido:', data);
    localStorage.setItem('userToken', data.token);
    // router.push('/dashboard'); // Exemplo de redirecionamento
  },
  onError: (error) => {
    console.error('Erro no login:', error);
  },
});

const handleLogin = () => {
  mutation.mutate({
    username: username.value,
    password: password.value,
  });
};
</script>