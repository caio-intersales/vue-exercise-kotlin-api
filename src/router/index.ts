import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductsView from '@/views/ProductsView.vue'
import OrdersView from '@/views/OrdersView.vue'
import UsersView from '@/views/UsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home | User API App' }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { title: 'Users\' management | User API App' }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { title: 'Products\' management | User API App' }
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      meta: { title: 'Orders\' management | User API App' }
    }
  ],
})

// Code needed for setting new titles for each page
router.afterEach((to) => {
  // Check if the current route has a title defined in its meta field
  if(to.meta.title) {
    // Set the document title to the value from meta.title
    document.title = to.meta.title as string
  }else{
    // Optional: Set a default title if none is specified
    document.title = "User Api - Frontend"
  }
})

export default router
