import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import ProjectsPage from '../views/ProjectsPage.vue'
import LanguagesPage from '../views/LanguagesPage.vue'
import ProjectDetailsPage from '../views/ProjectDetailsPage.vue'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
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
        path: 'projects/:id/translations',
        name: 'ProjectTranslations',
        component: ProjectDetailsPage,
        props: true
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('userToken')
  if (to.name !== 'Login' && !loggedIn) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && loggedIn) {
    next({ name: 'Projects' })
  } else {
    next()
  }
})

export default router