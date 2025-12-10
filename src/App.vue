<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import GreetingHeader from './components/GreetingHeader.vue';
import IconHome from './components/icons/IconHome.vue';
import IconUsers from './components/icons/IconUsers.vue';
import IconProducts from './components/icons/IconProducts.vue';
import IconOrders from './components/icons/IconOrders.vue';
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="125" height="125" />

    <div class="wrapper">
      <GreetingHeader mainMsg="User API" subMsg="Use the menu bellow to naviage through the entities." />

      <nav>
        
        <RouterLink to="/" class="nav-item-vertical"><IconHome/> Home</RouterLink>
        <RouterLink to="/users" class="nav-item-vertical"><IconUsers/> Manage users</RouterLink>
        <RouterLink to="/products" class="nav-item-vertical"><IconProducts/> Manage products</RouterLink>
        <RouterLink to="/orders" class="nav-item-vertical"><IconOrders/> Manage orders</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 10px;
}

nav a:first-of-type {
  border: 0;
}

a svg {
  vertical-align: middle;
}

@media (min-width: 1024px) {
  header {
    display: inline-flex;
    flex-direction: column;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 auto 2rem;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    align-items: center;
    text-align: center;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }

  .nav-item-vertical {
    min-width: 50%;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    margin-top: 1rem;
  }
}
</style>
