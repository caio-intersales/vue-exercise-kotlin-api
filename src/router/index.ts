import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductsView from '@/views/ProductsView.vue'
import OrdersView from '@/views/OrdersView.vue'
import UsersView from '@/views/UsersView.vue'
import AllUsersView from '@/views/users/AllUsersView.vue'
import SpecificUserView from '@/views/users/SpecificUserView.vue'
import EditUserView from '@/views/users/EditUserView.vue'
import DeleteUserView from '@/views/users/DeleteUserView.vue'
import AddUserView from '@/views/users/AddUserView.vue'

const appStandardTitle = '| User API App';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: `Home ${appStandardTitle}` }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      children: [
        {
          path: '',
          name: 'all-users',
          component: AllUsersView,
          meta: { title: `Users\' management ${appStandardTitle}` }     
        },
        {
          path: 'add',
          name: 'user-add',
          component: AddUserView,
          meta: { title : `Add a new user ${appStandardTitle}` } 
        },
        {
          path: 'view/:id',
          name: 'user-info',
          component: SpecificUserView,
          meta: { title: `User information ${appStandardTitle}` }
        },
        {
          path: 'edit/:id',
          name: 'user-edit',
          component: EditUserView,
          meta: { title: `Editing user information ${appStandardTitle}` }
        },
        {
          path: 'delete/:id',
          name: 'user-delete',
          component: DeleteUserView,
          meta: { title: `Deleting user ${appStandardTitle}` }
        }
      ],       
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { title: 'Products\' management' + appStandardTitle }
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      meta: { title: 'Orders\' management' + appStandardTitle }
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
