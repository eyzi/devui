import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home/Index.vue'
import AppPage from '../views/AppPage/Index.vue'
import Steam from '../views/Steam/Index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/steam',
    name: 'Steam',
    component: Steam
  },
  {
    path: '/app/:id',
    name: 'App Page',
    component: AppPage
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
