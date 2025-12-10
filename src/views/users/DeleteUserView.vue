<script setup lang="ts">
import { useUsers } from '@/composables/useUsers';
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route     = useRoute();
const router    = useRouter();
const { currentUser, loading, error, fetchUserById, deleteUser } = useUsers();

// Function that calls API
const loadUser = (id: string) => {
    fetchUserById(parseInt(id));
}

// Function to handle deletion
const handleDelete = async () => {
    // Basic check to ensure that an ID was provided
    if(!currentUser.value || !currentUser.value.id) {
        alert("Error: No user data available for deletion.");
        return;
    }

    // Ask for user confirmation
    if (confirm(`Do you want to permanently delete ${currentUser.value.firstName} ${currentUser.value.lastName}? This cannot be undone.`)){
        // Call composable function
        const success = await deleteUser(currentUser.value.id);

        if(success) {
            alert("The user was successfully deleted.");

            router.push({ name: 'all-users' });
        } else {
            // Display the error from the composable
            alert(`Deletion: failed ${error.value}`);
        }
    }
}

onMounted(() => {
    loadUser(route.params.id as string)
});

// Watch for changes in the route parameter
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
        Loading user...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        User could not be loaded.
    </div>

    <!-- Data div -->
    <div v-else-if="currentUser">
        <h2>Are you sure that you want to delete {{ currentUser.firstName }} {{ currentUser.lastName }} (ID # {{ currentUser.id }})?</h2>

        <div>
            <button
                @click="handleDelete"
                class="delete-button"
                :disabled="loading"
                title="Permantently delete user"
            >
                Yes, delete the user
            </button>

            <button
                @click="router.back()">
                Cancel
            </button>
        </div>
        
    </div>

    <!-- No param div -->
    <div v-else>
        No parameter was sent.
    </div>
</template>