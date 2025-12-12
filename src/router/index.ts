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
import AllProductsView from '@/views/products/AllProductsView.vue'
import AddProductView from '@/views/products/AddProductView.vue'
import SpecificProductView from '@/views/products/SpecificProductView.vue'
import EditProductView from '@/views/products/EditProductView.vue'
import DeleteProductView from '@/views/products/DeleteProductView.vue'
import AllOrdersView from '@/views/orders/AllOrdersView.vue'
import AddOrderView from '@/views/orders/AddOrderView.vue'
import SpecificOrderView from '@/views/orders/SpecificOrderView.vue'
import EditOrderView from '@/views/orders/EditOrderView.vue'
import DeleteOrderView from '@/views/orders/DeleteOrderView.vue'
import SearchOwnerOrderView from '@/views/orders/SearchOwnerOrderView.vue'
import SearchDateOrderView from '@/views/orders/SearchDateOrderView.vue'
import SearchOrder from '@/views/orders/SearchOrder.vue'

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
      children: [
        {
          path: '',
          name: 'all-products',
          component: AllProductsView,
          meta: { title: `Products\' management ${appStandardTitle}` }     
        },
        {
          path: 'add',
          name: 'product-add',
          component: AddProductView,
          meta: { title : `Add a new product ${appStandardTitle}` } 
        },
        {
          path: 'view/:id',
          name: 'product-info',
          component: SpecificProductView,
          meta: { title: `Product information ${appStandardTitle}` }
        },
        {
          path: 'edit/:id',
          name: 'product-edit',
          component: EditProductView,
          meta: { title: `Editing product information ${appStandardTitle}` }
        },
        {
          path: 'delete/:id',
          name: 'product-delete',
          component: DeleteProductView,
          meta: { title: `Deleting product ${appStandardTitle}` }
        }
      ],       
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      children: [
        {
          path: '',
          name: 'all-orders',
          component: AllOrdersView,
          meta: { title: `Orders\' management ${appStandardTitle}` }     
        },
        {
          path: 'add',
          name: 'order-add',
          component: AddOrderView,
          meta: { title : `Add a new order ${appStandardTitle}` } 
        },
        {
          path: 'view/:id',
          name: 'order-info',
          component: SpecificOrderView,
          meta: { title: `Order information ${appStandardTitle}` }
        },
        {
          path: 'edit/:id',
          name: 'order-edit',
          component: EditOrderView,
          meta: { title: `Editing order information ${appStandardTitle}` }
        },
        {
          path: 'delete/:id',
          name: 'order-delete',
          component: DeleteOrderView,
          meta: { title: `Deleting order ${appStandardTitle}` }
        },
        {
          path: 'search',
          name: 'order-search',
          component: SearchOrder,
          meta: { title: `Search orders ${appStandardTitle}` },
          children: [
            {
              path: 'owner/:ownerId',
              name: 'order-search-owner',
              component: SearchOwnerOrderView,
              meta: { title: `Search by Issuer ${appStandardTitle}` }
            },
            {
              path: 'date',
              name: 'order-serch-date',
              component: SearchDateOrderView,
              meta: { title: `Search by Date ${appStandardTitle}` }
            }
          ]
        }
      ],       
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
