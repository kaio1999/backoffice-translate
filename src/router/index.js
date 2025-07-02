import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import ProjectsPage from '../views/ProjectsPage.vue'
import LanguagesPage from '../views/LanguagesPage.vue'
import ProjectDetailsPage from '../views/ProjectDetailsPage.vue'
import MainLayout from '../layouts/MainLayout.vue' // Opcional: Layout principal

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/',
    component: MainLayout, // Usa um layout principal para as rotas autenticadas
    children: [
      {
        path: '', // Redireciona a raiz para projetos após login
        redirect: '/projects'
      },
      {
        path: 'projects',
        name: 'Projects',
        component: ProjectsPage
      },
      {
        path: 'languages',
        name: 'Languages',
        component: LanguagesPage
      },
      {
        path: 'projects/:id/translations', // Rota para detalhes de traduções de um projeto
        name: 'ProjectTranslations',
        component: ProjectDetailsPage,
        props: true // Permite que o ID seja passado como prop para o componente
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Simples "guard" de rota para MVP1 (apenas verifica se tem token ou algo similar)
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('userToken') // Simples token no localStorage
  if (to.name !== 'Login' && !loggedIn) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && loggedIn) {
    next({ name: 'Projects' }) // Se já logado, redireciona para projetos
  } else {
    next()
  }
})

export default router