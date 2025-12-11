<script setup lang="ts">
import { useProducts } from '@/composables/useProducts';
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route     = useRoute();
const router    = useRouter();
const { currentProduct, loading, error, fetchProductById, deleteProduct } = useProducts();

// Function that calls API
const loadProduct = (id: string) => {
    fetchProductById(parseInt(id));
}

// Function to handle deletion
const handleDelete = async () => {
    // Basic check to ensure that an ID was provided
    if(!currentProduct.value || !currentProduct.value.id) {
        alert("Error: No user data available for deletion.");
        return;
    }

    // Ask for user confirmation
    if (confirm(`Do you want to permanently delete ${currentProduct.value.productName} (ID ${currentProduct.value.id})? This cannot be undone.`)){
        // Call composable function
        const success = await deleteProduct(currentProduct.value.id);

        if(success) {
            alert("The product was successfully deleted.");

            router.push({ name: 'all-products' });
        } else {
            // Display the error from the composable
            alert(`Deletion: failed ${error.value}`);
        }
    }
}

onMounted(() => {
    loadProduct(route.params.id as string)
});

// Watch for changes in the route parameter
watch(
    () => route.params.id,
    (newId) => {
        if(newId) {
            loadProduct(newId as string);
        }
    }
);
</script>

<template>
    <!-- Loading div -->
    <div v-if="loading">
        Loading product...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        Product could not be loaded.
    </div>

    <!-- Data div -->
    <div v-else-if="currentProduct">
        <h2>Are you sure that you want to delete {{ currentProduct.productName }} (ID # {{ currentProduct.id }})?</h2>

        <div>
            <button
                @click="handleDelete"
                class="delete-button"
                :disabled="loading"
                title="Permantently delete product"
            >
                Yes, delete the product
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