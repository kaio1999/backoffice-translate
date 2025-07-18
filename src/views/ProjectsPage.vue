<template>
  <v-container fluid>
    <v-card class="pa-6 elevation-2 rounded-lg">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">
          <v-icon large class="mr-2">mdi-folder-multiple</v-icon>
          Gerenciamento de Projetos
        </h1>
        <v-btn color="primary" large @click="openProjectDialog()">
          <v-icon left>mdi-plus-circle</v-icon> Novo Projeto
        </v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="projects"
        item-key="id"
        class="elevation-0"
        no-data-text="Nenhum projeto encontrado. Clique em 'Novo Projeto' para começar!"
      >
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn icon small @click="openProjectDialog(item)" v-bind="props">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Editar Projeto</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn icon small @click="deleteProject(item.id)" v-bind="props">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Excluir Projeto</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                color="info"
                small
                text
                class="ml-2"
                :to="{ name: 'ProjectTranslations', params: { id: item.id } }"
                v-bind="props"
              >
                <v-icon left>mdi-earth</v-icon> Ver Traduções
              </v-btn>
            </template>
            <span>Gerenciar Traduções deste Projeto</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-dialog v-model="projectDialog" max-width="550px">
        <v-card class="rounded-lg">
          <v-card-title class="headline pa-5 bg-primary text-white">
            {{ editedProject.id ? 'Editar Projeto' : 'Criar Novo Projeto' }}
          </v-card-title>
          <v-card-text class="pa-5">
            <v-text-field
              v-model="editedProject.name"
              label="Nome do Projeto"
              outlined
              dense
              color="primary"
              :rules="[v => !!v || 'Nome do projeto é obrigatório']"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="closeProjectDialog">Cancelar</v-btn>
            <v-btn color="primary" @click="saveProject" :loading="loadingSave">Salvar</v-btn>
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
  { title: 'ID', key: 'id', width: '10%' },
  { title: 'Nome do Projeto', key: 'name', width: '60%' },
  { title: 'Ações', key: 'actions', sortable: false, width: '30%' },
];

const projects = ref([]);
const projectDialog = ref(false);
const editedProject = ref({ id: null, name: '' });
const loadingSave = ref(false);
const snackbar = ref({ show: false, message: '', color: '' });

const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    projects.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    snackbar.value = { show: true, message: 'Erro ao carregar projetos.', color: 'error' };
  }
};

const openProjectDialog = (project = { id: null, name: '' }) => {
  editedProject.value = { ...project };
  projectDialog.value = true;
};

const closeProjectDialog = () => {
  projectDialog.value = false;
  editedProject.value = { id: null, name: '' };
};

const saveProject = async () => {
  if (!editedProject.value.name) {
    snackbar.value = { show: true, message: 'O nome do projeto é obrigatório!', color: 'warning' };
    return;
  }

  loadingSave.value = true;
  try {
    if (editedProject.value.id) {
      await axios.put(`${API_BASE_URL}/projects/${editedProject.value.id}`, editedProject.value, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Projeto atualizado com sucesso!', color: 'success' };
    } else {
      const newId = Math.max(0, ...projects.value.map(p => p.id)) + 1;
      const projectToSave = { ...editedProject.value, id: newId };
      await axios.post(`${API_BASE_URL}/projects`, projectToSave, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Projeto criado com sucesso!', color: 'success' };
    }
    closeProjectDialog();
    await fetchProjects();
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    snackbar.value = { show: true, message: 'Erro ao salvar projeto.', color: 'error' };
  } finally {
    loadingSave.value = false;
  }
};

const deleteProject = async (id) => {
  if (confirm('Tem certeza que deseja excluir este projeto? Esta ação é irreversível.')) {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      snackbar.value = { show: true, message: 'Projeto excluído com sucesso!', color: 'success' };
      await fetchProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      snackbar.value = { show: true, message: 'Erro ao excluir projeto.', color: 'error' };
    }
  }
};

onMounted(fetchProjects);
</script>