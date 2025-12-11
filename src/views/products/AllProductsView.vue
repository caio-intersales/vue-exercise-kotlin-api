<script setup lang="ts">
import { useProducts } from '@/composables/useProducts';
import { onMounted } from 'vue';

// Get the data and functions from the composable
const { allProducts, loading, error, fetchAllProducts } = useProducts();

// Call the fetch function when the component is mounted
onMounted(() => {
    fetchAllProducts();
});
</script>

<template>
    <div>
        <h2>All products</h2>

        <p v-if="loading">Loading product data...</p>
        <p v-else-if="error">Error: {{ error }}</p>

        <p v-else-if="allProducts.length == 0">
            There are no products in the system yet :/
        </p>
        <table class="info-table" v-else>
            <tr>
                <td>Type</td>
                <td>Name</td>
                <td>Price</td>
                <td>In storage</td>
                <td>See details</td>
            </tr>
            <tr v-for="product in allProducts" :key="product.id">
                <td>{{ product.productType }}</td>
                <td>{{ product.productName }}</td>
                <td>$ {{ product.productPrice }}</td>
                <td>{{ product.productQnt }} units</td>
                <td align="center">
                    <RouterLink :to="{ name: 'product-info', params: { id: product.id} }" title="Open product information"><img src="@/assets/see.png" width="20" /></RouterLink>
                </td>
            </tr>
        </table>
    </div>
</template>