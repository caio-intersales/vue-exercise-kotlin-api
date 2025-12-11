<script setup lang="ts">
import { useProducts, BasicProductData } from '@/composables/useProducts';
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const { createProduct, loading, error } = useProducts();

// Initial state: define the empty data object passed to the form
const initialFormState = ref<BasicProductData>({
    productName: '',
    productType: 0,
    productPrice: 0,
    productQnt: 0
});

// Event handler: receives the cleaned data from ProductForm and calls the API
const handleSubmit = async (formData: BasicProductData) => {

    // Simple client-side validation
    if(!formData.productName) {
        alert("Give at least the name of the product.");
        return;
    }

    // Cast the payload to BasicProductData (which createProduct expects)
    const createdProduct = await createProduct(formData as BasicProductData);
    
    if (createdProduct) {
        alert("Product added successfully! You'll be redirected to the product's page.")
        // Redirection on success
        router.push({
            name: 'product-info',
            params: { id: createdProduct.id }
        });
    }
};
</script>

<template>
    <div class="container">
        <h2>Add new product</h2>

        
    </div>
</template>