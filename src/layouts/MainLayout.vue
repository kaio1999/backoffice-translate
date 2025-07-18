<template>
  <v-app>
    <v-app-bar app color="primary" dark flat>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold">
        <v-icon left>mdi-translate</v-icon>
        i18n Manager
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">
        <v-icon left>mdi-logout</v-icon> Sair
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list-item class="pa-4">
        <v-list-item-content>
          <v-list-item-title class="text-h6">Navegação</v-list-item-title>
          <v-list-item-subtitle>Gerenciamento Central</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item link :to="{ name: 'Projects' }" color="primary">
          <v-list-item-icon><v-icon>mdi-folder-multiple</v-icon></v-list-item-icon>
          <v-list-item-title>Projetos</v-list-item-title>
        </v-list-item>
        <v-list-item link :to="{ name: 'Languages' }" color="primary">
          <v-list-item-icon><v-icon>mdi-web</v-icon></v-list-item-icon>
          <v-list-item-title>Idiomas</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="grey lighten-4"> <v-container fluid class="pa-6">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const drawer = ref(true);

const logout = () => {
  localStorage.removeItem('userToken');
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.v-list-item-icon {
  margin-right: 16px !important;
}
</style>