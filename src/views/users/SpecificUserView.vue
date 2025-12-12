<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUsers } from '@/composables/useUsers'

const route = useRoute();
const { currentUser, loading, error, fetchUserById } = useUsers();

// Function that calls API
const loadUser = (id: string) => {
    // As the route param is a string, it must be converted to number
    fetchUserById(parseInt(id));
};

onMounted(() => { 
    loadUser(route.params.id as string)
});

// Watch for changes in the route parameter (if the user navigates to another page)
watch(
    () => route.params.id,
    (newId) => {
        if(newId) {
            loadUser(newId as string);
        }
    }
);
</script>

<template>

    <!-- Loading div -->
    <div v-if="loading">
        Loading user information...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        Error: {{ error }}
    </div>

    <!-- Data div -->    
    <div v-else-if="currentUser">
        <h2>Data from "{{ currentUser.firstName }} {{ currentUser.lastName }}"</h2>
        
        <ul>
            <li>
                ID: {{ currentUser.id }}
            </li>
            <li>
                First name: {{ currentUser.firstName }}
            </li>
            <li>
                Last name: {{ currentUser.lastName }}
            </li>
            <li>
                Email address: {{ currentUser.email }}
            </li>
            <li>
                Delivery address: <span v-if="currentUser.deliveryAddress == ''"><i>No address set yet</i></span><span v-else>{{ currentUser.deliveryAddress }}</span>
            </li>
        </ul>

        <div style="margin-top: 50px;">
            <p>
                <RouterLink :to="{ name: 'order-search-owner', params: { ownerId: currentUser.id } }" title="See user's orders">
                    <img src="@/assets/order.png" width="15" height="15" /> See their orders
                </RouterLink>
            </p>
            <p>
                <RouterLink :to="{ name: 'user-edit', params: { id: currentUser.id } }" title="Edit user information">
                    <img src="@/assets/edit.png" width="15" height="15" /> Edit information
                </RouterLink>
            </p>
            <p>
                <RouterLink :to="{ name: 'user-delete', params: { id: currentUser.id } }" title="Delete this user">
                    <img src="@/assets/delete.png" width="15" height="15" /> Delete user
                </RouterLink>
            </p>
        </div>        
    </div>

    <!-- No param div -->
    <div v-else>
        No user selected.
    </div>

</template>