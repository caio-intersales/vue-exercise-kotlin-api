<script setup lang="ts">
import IconProducts from '@/components/icons/IconProducts.vue';

</script>

<template>
    <main>
        <header>
            <div class="top-icon">
                <IconProducts size="100" />
                <h2>Products' management</h2>
                In this dashboard, you can see all the products that have been added to the system, see their individual data, add new products, or delete existing ones.
            </div>

            <nav>
                <RouterLink to="/products">Show all</RouterLink>
                <RouterLink to="/products/add">Add new</RouterLink>
            </nav>
        </header>

        <RouterView />
    </main>
</template>