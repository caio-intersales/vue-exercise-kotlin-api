<script setup lang="ts">
import IconUsers from './icons/IconUsers.vue'
import HomeItem from './HomeItem.vue'
import IconProducts from './icons/IconProducts.vue'
import IconOrders from './icons/IconOrders.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>

<template>
  <p>
    This is a simple frontend application to manage user, product, and order data from a PostgreSQL database using a RestAPI coded in Kotlin+Quarkus. You can check out below what you can do in this simple application. You can navigate through the different areas by selecting the specific area on the menu.
  </p>

  <HomeItem>
    <template #icon>
      <IconUsers />
    </template>
    <template #heading>Users' management</template>

    Under "<i>Manage users</i>" you can view all users, select a specific user, create a new one, update existing ones, and delete them individually.
  </HomeItem>

  <HomeItem>
    <template #icon>
      <IconProducts />
    </template>
    <template #heading>Products' management</template>

    Under "<i>Manage products</i>" you can view all products, select a specific product, create a new one, update existing ones, and delete them individually.
  </HomeItem>

  <HomeItem>
    <template #icon>
      <IconOrders />
    </template>
    <template #heading>Orders' management</template>

    Under "<i>Manage orders</i>" you can view all orders, select orders per user, per start or end dates (or both!), select a specific order, create a new one, update existing ones, and delete them individually.
  </HomeItem>
</template>

<style lang="css" scoped>
  p {
    margin-bottom: 2rem;
  }
</style>