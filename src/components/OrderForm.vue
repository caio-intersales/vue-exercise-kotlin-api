<script setup lang="ts">
import type { BasicOrderData } from '@/composables/useOrders';
import { useProducts } from '@/composables/useProducts';
import { useUsers } from '@/composables/useUsers';
import { onMounted, ref, watch } from 'vue';

// Import user & products composables to show lists
const { allUsers, fetchAllUsers } = useUsers();
const { allProducts, fetchAllProducts } = useProducts();

// Define props
const props = defineProps<{
    mode: 'create' | 'edit';
    initialData: BasicOrderData;
    loading: boolean;
    error: string | null;
    submitText: string;
}>();

// Define the event sent when the form is submitted
const emit = defineEmits<{
    (e: 'submitForm', payload: BasicOrderData): void
}>();

// Create a reactive, mutable copy of the prop data
const formState = ref<BasicOrderData>({ ...props.initialData });

// Ensures the local formState updates if there are changes in the initialData prop
watch(
    () => props.initialData,
    (newVal) => {
        if(newVal) {
            formState.value = { ...newVal };
        }
    },
    { deep: true, immediate: true }
);

// Handles the form submission
const handleSubmit = () => {
    const payload = { ...formState.value };

    emit('submitForm', payload);
};

// Calls the functions to render the users and products
onMounted(() => {
    fetchAllUsers();
    fetchAllProducts();
});
</script>

<template>
    <form @submit.prevent="handleSubmit">

        <div class="form-group">
            <label for="orderIssuerSelect">Order issuer:</label>
            
            <select
                id="orderIssuerSelect"  
                v-model="formState.orderOwner" 
                class="form-control" 
                required
            >
                <option :value="null" disabled selected>-- Select an Order Issuer --</option>
                
                <option 
                    v-for="issuer in allUsers" 
                    :key="issuer.id"
                    :value="issuer.id"
                >
                    {{ issuer.firstName }} {{ issuer.lastName }}
                </option>
                
            </select>
        </div>

        <div class="form-group">
            <label for="products">Products:</label>
            <div v-for="product in allProducts" :key="product.id">
                <input
                    type="checkbox"
                    name="products_group"
                    :id="`product-id-${product.id}`"
                    :value="product.id"
                    v-model="formState.orderProducts"
                />
                <label :for="`product-id-${product.id}`">
                    {{ product.productName }}
                </label>
            </div>
        </div>

        <input id="id" v-if="props.mode === 'edit'" type="hidden" v-model="formState.id" />

        <button type="submit" :disabled="props.loading">
            {{ props.loading ? 'Processing...' : props.submitText }}
        </button>

        <p v-if="props.error" class="error-message">
            Error: {{ props.error }}
        </p>
    </form>
</template>