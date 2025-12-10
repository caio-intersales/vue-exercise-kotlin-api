<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsers } from '@/composables/useUsers';

// Get the data and function from the composable
const { allUsers, loading, error, fetchAllUsers } = useUsers();

// Call the fetch function when the component is mounted
onMounted(() => {
    fetchAllUsers();
});
</script>

<template>
    <div>
        <h2>All Users</h2>

        <p v-if="loading">Loading user data...</p>
        <p v-else-if="error">Error: {{ error }}</p>

        <p v-else-if="allUsers.length == 0">
            There are no users in the system yet :/
        </p>
        <table class="info-table" v-else>
            <tr>
                <td>First name</td>
                <td>Last name</td>
                <td>Email address</td>
                <td align="center">See details</td>
            </tr>
            <tr v-for="user in allUsers" :key="user.id">
                <td>{{ user.firstName }}</td>
                <td>{{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td align="center">
                    <RouterLink :to="{ name: 'user-info', params: { id: user.id} }" title="Open user information"><img src="@/assets/see.png" width="20" /></RouterLink>
                </td>
            </tr>
        </table>
    </div>
</template>