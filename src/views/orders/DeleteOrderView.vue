<script setup lang="ts">
import { useOrders } from '@/composables/useOrders';
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route     = useRoute();
const router    = useRouter();
const { currentOrder, loading, error, fetchOrderById, deleteOrder } = useOrders();

// Function that calls API
const loadOrder = (id: string) => {
    fetchOrderById(parseInt(id));
}

// Function to handle deletion
const handleDelete = async () => {
    // Basic check to ensure that an ID was provided
    if(!currentOrder.value || !currentOrder.value.id) {
        alert("Error: No order data available for deletion.");
        return;
    }

    // Ask for user confirmation
    if (confirm(`Do you want to permanently delete order # ${currentOrder.value.id}? This cannot be undone.`)){
        // Call composable function
        const success = await deleteOrder(currentOrder.value.id);

        if(success) {
            alert("The order was successfully deleted.");

            router.push({ name: 'all-orders' });
        } else {
            // Display the error from the composable
            alert(`Deletion: failed ${error.value}`);
        }
    }
}

onMounted(() => {
    loadOrder(route.params.id as string)
});

// Watch for changes in the route parameter
watch(
    () => route.params.id,
    (newId) => {
        if(newId) {
            loadOrder(newId as string);
        }
    }
);
</script>

<template>
    <!-- Loading div -->
    <div v-if="loading">
        Loading order...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        Order could not be loaded.
    </div>

    <!-- Data div -->
    <div v-else-if="currentOrder">
        <h2>Are you sure that you want to delete order # {{ currentOrder.id }})?</h2>

        <div>
            <button
                @click="handleDelete"
                class="delete-button"
                :disabled="loading"
                title="Permantently delete order"
            >
                Yes, delete the order
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