<script setup lang="ts">
import { useProducts } from '@/composables/useProducts';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const { currentProduct, loading, error, fetchProductById } = useProducts();

// Function that calls API
const loadProduct = (id: string) => {
    // Parse ID as id, converting it to number
    fetchProductById(parseInt(id));
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
        Loading user information...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        Error: {{ error }}
    </div>

    <!-- Data div -->    
    <div v-else-if="currentProduct">
        <h2>Data from "{{ currentProduct.productName }}" (ID # {{ currentProduct.id }})</h2>
        
        <ul>
            <li>
                ID: {{ currentProduct.id }}
            </li>
            <li>
                Product name: {{ currentProduct.productName }}
            </li>
            <li>
                Product type: {{ currentProduct.productType }}
            </li>
            <li>
                Product price: $ {{ currentProduct.productPrice }}
            </li>
            <li>
                How many units in storage: {{ currentProduct.productQnt }}
            </li>
        </ul>

        <div style="margin-top: 50px;">
            <p>
                <RouterLink :to="{ name: 'product-edit', params: { id: currentProduct.id } }" title="Edit product information">
                    <img src="@/assets/edit.png" width="15" height="15" /> Edit information
                </RouterLink>
            </p>
            <p>
                <RouterLink :to="{ name: 'product-delete', params: { id: currentProduct.id } }" title="Delete this product">
                    <img src="@/assets/delete.png" width="15" height="15" /> Delete product
                </RouterLink>
            </p>
        </div>        
    </div>

    <!-- No param div -->
    <div v-else>
        No user selected.
    </div>
</template>