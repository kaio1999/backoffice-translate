// src/services/authService.js
import axios from 'axios';

// Instância do Axios com a URL base (opcional, mas recomendado)
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/auth', // Sua URL base do backend aqui
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    return response.data; // Retorna os dados da resposta (message, token)
  } catch (error) {
    // Rejeita a Promise para que o useMutation.onError possa capturá-la
    throw error;
  }
};

// Você poderia adicionar outras funções de autenticação aqui:
// export const register = async (userData) => { ... };
// export const logout = async () => { ... };