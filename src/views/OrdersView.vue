<script setup lang="ts">
import IconOrders from '@/components/icons/IconOrders.vue';

</script>

<template>
    <main>
        <header>
            <div class="top-icon">
                <IconOrders size="100" />
                <h2>Orders' management</h2>
                In this dashboard, you can see all the orders that have been added to the system, see their individual data, add new orders, or delete existing ones.
            </div>

            <nav>
                <RouterLink to="/orders">Show all</RouterLink>
                <RouterLink to="/orders/add">Add new</RouterLink>
            </nav>
        </header>

        <RouterView />
    </main>
</template>