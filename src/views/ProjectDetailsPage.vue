<template>
  <v-container fluid>
    <v-card class="pa-6 elevation-2 rounded-lg">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">
          <v-icon large class="mr-2">mdi-translate</v-icon>
          Traduções para o Projeto: <span class="text-primary">{{ projectName }}</span>
        </h1>
        <div class="d-flex align-center">
          <v-select
            v-model="selectedLanguageCode"
            :items="languages"
            item-title="name"
            item-value="code"
            label="Selecionar Idioma"
            outlined
            dense
            hide-details
            color="primary"
            class="mr-4"
            @update:model-value="fetchTranslations"
            style="min-width: 200px;"
          ></v-select>
          <v-btn color="primary" large @click="openTranslationDialog()">
            <v-icon left>mdi-plus-circle</v-icon> Nova Tradução
          </v-btn>
        </div>
      </div>

      <v-text-field
        v-model="searchQuery"
        label="Buscar por chave ou valor"
        prepend-inner-icon="mdi-magnify"
        outlined
        dense
        clearable
        class="mb-4"
        @input="filterTranslations"
      ></v-text-field>

      <v-data-table
        :headers="headers"
        :items="filteredTranslations"
        item-key="id"
        class="elevation-0"
        no-data-text="Nenhuma tradução encontrada para o idioma selecionado. Adicione uma ou selecione outro idioma."
        :loading="loadingTranslations"
      >
        <template v-slot:item.value="{ item }">
          <v-text-field
            v-model="item.value"
            outlined
            dense
            hide-details
            class="my-2"
            @blur="saveTranslation(item)"
            @keyup.enter="saveTranslation(item)"
            color="primary"
          ></v-text-field>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn icon small @click="deleteTranslation(item.id)" v-bind="props">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Excluir Tradução</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-dialog v-model="translationDialog" max-width="550px">
        <v-card class="rounded-lg">
          <v-card-title class="headline pa-5 bg-primary text-white">Nova Tradução</v-card-title>
          <v-card-text class="pa-5">
            <v-text-field
              v-model="newTranslation.key_name"
              label="Nome da Chave (Ex: common.button.save)"
              outlined
              dense
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Nome da chave é obrigatório']"
            ></v-text-field>
            <v-text-field
              v-model="newTranslation.value"
              label="Valor da Tradução"
              outlined
              dense
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Valor da tradução é obrigatório']"
            ></v-text-field>
            <v-select
              v-model="newTranslation.language_code"
              :items="languages"
              item-title="name"
              item-value="code"
              label="Idioma"
              outlined
              dense
              color="primary"
              :rules="[v => !!v || 'Idioma é obrigatório']"
            ></v-select>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="closeTranslationDialog">Cancelar</v-btn>
            <v-btn color="primary" @click="addNewTranslation" :loading="loadingAdd">Adicionar</v-btn>
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
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const route = useRoute();
const projectId = ref(route.params.id);
const projectName = ref('');
const languages = ref([]);
const selectedLanguageCode = ref(null);

const allTranslations = ref([]);
const translations = ref([]);
const searchQuery = ref('');
const loadingTranslations = ref(false);
const loadingAdd = ref(false);

const translationDialog = ref(false);
const newTranslation = ref({ id: null, key_name: '', value: '', language_code: null });
const snackbar = ref({ show: false, message: '', color: '' });

const headers = [
  { title: 'Chave de Tradução', key: 'key_name', width: '40%' },
  { title: 'Valor da Tradução', key: 'value', width: '45%' },
  { title: 'Ações', key: 'actions', sortable: false, width: '15%' },
];

const fetchProjectName = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    projectName.value = response.data.name;
  } catch (error) {
    console.error('Erro ao buscar nome do projeto:', error);
    snackbar.value = { show: true, message: 'Erro ao carregar nome do projeto.', color: 'error' };
  }
};

const fetchLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/languages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    languages.value = response.data;
    if (languages.value.length > 0 && !selectedLanguageCode.value) {
      selectedLanguageCode.value = languages.value[0].code;
    }
  } catch (error) {
    console.error('Erro ao buscar idiomas:', error);
    snackbar.value = { show: true, message: 'Erro ao carregar idiomas.', color: 'error' };
  }
};

const fetchTranslations = async () => {
  if (!selectedLanguageCode.value || !projectId.value) {
    translations.value = [];
    allTranslations.value = [];
    return;
  }
  loadingTranslations.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId.value}/translations/${selectedLanguageCode.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    allTranslations.value = response.data;
    filterTranslations();
  } catch (error) {
    console.error('Erro ao buscar traduções:', error);
    allTranslations.value = [];
    translations.value = [];
    snackbar.value = { show: true, message: 'Erro ao carregar traduções.', color: 'error' };
  } finally {
    loadingTranslations.value = false;
  }
};

const openTranslationDialog = () => {
  newTranslation.value = { id: null, key_name: '', value: '', language_code: selectedLanguageCode.value || (languages.value.length > 0 ? languages.value[0].code : null) };
  translationDialog.value = true;
};

const closeTranslationDialog = () => {
  translationDialog.value = false;
  newTranslation.value = { id: null, key_name: '', value: '', language_code: null };
};

const addNewTranslation = async () => {
  if (!newTranslation.value.key_name || !newTranslation.value.value || !newTranslation.value.language_code) {
    snackbar.value = { show: true, message: 'Todos os campos são obrigatórios!', color: 'warning' };
    return;
  }

  loadingAdd.value = true;
  try {
    const newId = Math.max(0, ...allTranslations.value.map(t => t.id || 0)) + 1; // Simula ID
    const translationToSave = {
      ...newTranslation.value,
      id: newId,
      project_id: parseInt(projectId.value)
    };
    await axios.post(`${API_BASE_URL}/keys`, translationToSave, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    snackbar.value = { show: true, message: 'Nova tradução adicionada com sucesso!', color: 'success' };
    closeTranslationDialog();
    await fetchTranslations();
  } catch (error) {
    console.error('Erro ao adicionar nova tradução:', error);
    snackbar.value = { show: true, message: 'Erro ao adicionar nova tradução. Verifique se a chave já existe para este idioma.', color: 'error' };
  } finally {
    loadingAdd.value = false;
  }
};

const saveTranslation = async (translation) => {
  try {
    await axios.put(`${API_BASE_URL}/keys/${translation.id}`, translation, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    snackbar.value = { show: true, message: 'Tradução salva com sucesso!', color: 'success' };
  } catch (error) {
    console.error('Erro ao salvar tradução:', error);
    snackbar.value = { show: true, message: 'Erro ao salvar tradução.', color: 'error' };
  }
};

const deleteTranslation = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta tradução?')) {
    try {
      await axios.delete(`${API_BASE_URL}/keys/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Tradução excluída com sucesso!', color: 'success' };
      await fetchTranslations();
    } catch (error) {
      console.error('Erro ao excluir tradução:', error);
      snackbar.value = { show: true, message: 'Erro ao excluir tradução.', color: 'error' };
    }
  }
};

const filterTranslations = () => {
  if (!searchQuery.value) {
    translations.value = [...allTranslations.value];
    return;
  }
  const query = searchQuery.value.toLowerCase();
  translations.value = allTranslations.value.filter(t =>
    t.key_name.toLowerCase().includes(query) ||
    t.value.toLowerCase().includes(query)
  );
};

onMounted(async () => {
  await fetchProjectName();
  await fetchLanguages();
});

watch(selectedLanguageCode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchTranslations();
  }
});

watch(searchQuery, filterTranslations);
</script>