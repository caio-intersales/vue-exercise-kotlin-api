<script setup lang="ts">
import ProductForm from '@/components/ProductForm.vue';
import { useProducts, type BasicProductData, type Product } from '@/composables/useProducts';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


// Define the full structure of the data expected by the form component
interface FormInputData extends BasicProductData {
    id?: number | undefined;
}

const router    = useRouter();
const route     = useRoute();
const { currentProduct, fetchProductById, editProduct, loading, error } = useProducts();

// Define the empty data object passed to the form
const initialFormState = ref<FormInputData>({
    id: undefined,
    productName: '',
    productType: 0,
    productPrice: 0,
    productQnt: 0
});

const loadProduct = (id: string | string[] | undefined) => {
    // Check for 'undefined' (or null) first
    if(!id) {
        // Handle case where ID is mmissing
        console.error("No ID found in route parameters.");
        return;
    }

    let productIdString: string;

    // Check whether it is an array and, if so, use only first occurence
    if(Array.isArray(id)){
        productIdString = id[0]!;
    } else {
        productIdString = id;
    }

    // Turn into int (number)
    const productId = parseInt(productIdString);

    if(!isNaN(productId)){
        fetchProductById(productId);
    }
}

watch(currentProduct, (product) => {
    if (product) {
        // This maps the fetched product to the initialFormState
        initialFormState.value = {
            id: product.id,
            productName: product.productName,
            productType: product.productType,
            productPrice: product.productPrice,
            productQnt: product.productQnt,
        }
    }
}, { immediate: true });

const handleUpdate = async (formData: FormInputData) => {
    // Simple client-side validation
    if(!formData.productName) {
        alert("The name of the product is required.");
        return;
    }

    // Call the composable
    const success = await editProduct(formData as Product);

    if(success) {
        alert("Product updated successfully!");
        router.push({
            name: "product-info",
            params: { id: formData.id }
        });
    }
};

onMounted(() => {
    loadProduct(route.params.id);
});

watch(() => route.params.id, (newId) => {
    if(newId) {
        loadProduct(newId);
    }
});
</script>

<template>
    <div>
        <h2>Edit product</h2>

        <ProductForm
            mode="edit"
            :initial-data="initialFormState"
            :loading="loading"
            :error="error"
            submit-text="Edit product"
            @submit-form="handleUpdate"
        />
    </div>
</template>