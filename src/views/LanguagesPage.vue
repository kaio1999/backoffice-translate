<template>
  <v-container fluid>
    <v-card class="pa-6 elevation-2 rounded-lg">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">
          <v-icon large class="mr-2">mdi-web</v-icon>
          Idiomas Suportados
        </h1>
        <v-btn color="primary" large @click="openLanguageDialog()">
          <v-icon left>mdi-plus-circle</v-icon> Novo Idioma
        </v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="languages"
        item-key="code"
        class="elevation-0"
        no-data-text="Nenhum idioma encontrado. Adicione idiomas para gerenciar traduções."
      >
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn icon small @click="openLanguageDialog(item)" v-bind="props">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Editar Idioma</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn icon small @click="deleteLanguage(item.code)" v-bind="props">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Excluir Idioma</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-dialog v-model="languageDialog" max-width="550px">
        <v-card class="rounded-lg">
          <v-card-title class="headline pa-5 bg-primary text-white">
            {{ editedLanguage.code ? 'Editar Idioma' : 'Criar Novo Idioma' }}
          </v-card-title>
          <v-card-text class="pa-5">
            <v-text-field
              v-model="editedLanguage.name"
              label="Nome do Idioma"
              outlined
              dense
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Nome do idioma é obrigatório']"
            ></v-text-field>
            <v-text-field
              v-model="editedLanguage.code"
              label="Código do Idioma (Ex: en-US, pt-BR)"
              outlined
              dense
              color="primary"
              :disabled="!!editedLanguage.code"
              :rules="[v => !!v || 'Código do idioma é obrigatório']"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="closeLanguageDialog">Cancelar</v-btn>
            <v-btn color="primary" @click="saveLanguage" :loading="loadingSave">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      top
      right
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const headers = [
  { title: 'Código', key: 'code', width: '25%' },
  { title: 'Nome do Idioma', key: 'name', width: '50%' },
  { title: 'Ações', key: 'actions', sortable: false, width: '25%' },
];

const languages = ref([]);
const languageDialog = ref(false);
const editedLanguage = ref({ code: null, name: '' });
const loadingSave = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

const fetchLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/languages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    languages.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar idiomas:', error);
    snackbar.value = { show: true, message: 'Erro ao carregar idiomas.', color: 'error' };
  }
};

const openLanguageDialog = (language = { code: null, name: '' }) => {
  editedLanguage.value = { ...language };
  languageDialog.value = true;
};

const closeLanguageDialog = () => {
  languageDialog.value = false;
  editedLanguage.value = { code: null, name: '' };
};

const saveLanguage = async () => {
  if (!editedLanguage.value.name || !editedLanguage.value.code) {
    snackbar.value = { show: true, message: 'Nome e código do idioma são obrigatórios!', color: 'warning' };
    return;
  }

  loadingSave.value = true;
  try {
    if (editedLanguage.value.code) {
      await axios.put(`${API_BASE_URL}/languages/${editedLanguage.value.code}`, editedLanguage.value, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Idioma atualizado com sucesso!', color: 'success' };
    } else {
      await axios.post(`${API_BASE_URL}/languages`, editedLanguage.value, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Idioma criado com sucesso!', color: 'success' };
    }
    closeLanguageDialog();
    await fetchLanguages();
  } catch (error) {
    console.error('Erro ao salvar idioma:', error);
    snackbar.value = { show: true, message: 'Erro ao salvar idioma.', color: 'error' };
  } finally {
    loadingSave.value = false;
  }
};

const deleteLanguage = async (code) => {
  if (confirm('Tem certeza que deseja excluir este idioma? Isso pode afetar as traduções existentes.')) {
    try {
      await axios.delete(`${API_BASE_URL}/languages/${code}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Idioma excluído com sucesso!', color: 'success' };
      await fetchLanguages();
    } catch (error) {
      console.error('Erro ao excluir idioma:', error);
      snackbar.value = { show: true, message: 'Erro ao excluir idioma.', color: 'error' };
    }
  }
};

onMounted(fetchLanguages);
</script>