<script setup lang="ts">
import type { BasicProductData } from '@/composables/useProducts';
import { ref, watch } from 'vue';

interface ProductFormData extends BasicProductData {
    id?: number;
}

// Define props (contract with the parent view)
const props = defineProps<{
    mode: 'create' | 'edit';
    initialData: ProductFormData;
    loading: boolean;
    error: string | null;
    submitText: string;
}>();

// Define the event sent when the form is submitted
const emit = defineEmits<{
    (e: 'submitForm', payload: ProductFormData): void
}>();

// Create a reactive, mutable copy of the prop data
const formState = ref<ProductFormData>({ ...props.initialData });

// Ensures the local formState updates if the parent's initialData prop changes
// This is crucial for switching between different products in 'edit' mode
watch(
    () => props.initialData,
    (newVal) => {
        if(newVal) {
            formState.value = { ...newVal };
        }
    },
    { deep: true, immediate: true }
);

// Handles form submission and cleans up the payload
const handleSubmit = () => {
    const payload = { ...formState.value };

    // Emit the final data to the parent view
    emit('submitForm', payload);
};
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="productName">Product name:</label>
            <input id="productName" v-model="formState.productName" type="text" required>
        </div>

        <div class="form-group">
            <label for="productType">Product type:</label>
            <input id="productType" v-model="formState.productType" type="number" required>
        </div>

        <div class="form-group">
            <label for="productPrice">Price ($):
                <br><small>
                    <i>Use a . to separate decimals (ex. 9.99).</i>
                </small></label>
            <input id="productPrice" v-model="formState.productPrice" type="number" required step="0.01" min="0">
        </div>

        <div class="form-group">
            <label for="productQnt">How many is there in storage:</label>
            <input id="productQnt" v-model="formState.productQnt" type="number" required>
        </div>

        <input id="id" v-if="props.mode === 'edit'" type="hidden" v-model="formState.id" />

        <button type="submit" :disabled="props.loading">
            {{ props.loading ? 'Processing...' : props.submitText }}
        </button>

        <p v-if="props.error" class="error-message">Error: {{ props.error }}</p>
    </form>
</template>