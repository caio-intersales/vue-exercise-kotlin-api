<script setup lang="ts">
import IconUsers from '@/components/icons/IconUsers.vue';
</script>

<template>
    <main>
        <header>
            <div class="top-icon">
                <IconUsers size="100" />
                <h2>Users' management</h2>
                In this simple dashboard, you can see all the users that have been added to the system, see their individual data, add new users, or delete existing ones.
            </div>
            <nav>
                <RouterLink to="/users/">Show all</RouterLink>
                <RouterLink to="/users/add">Add new</RouterLink>
            </nav>
        </header>       

        <RouterView />
    </main>
</template>