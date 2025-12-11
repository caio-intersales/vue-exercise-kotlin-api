<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BasicUserData } from '@/composables/useUsers'; 

interface UserFormData extends BasicUserData {
    id?: number;
    rawPassword?: string; 
}

// 1. PROPS: Define the contract with the parent view
const props = defineProps<{
    mode: 'create' | 'edit';
    initialData: UserFormData; // The data used to initialise the form
    loading: boolean;
    error: string | null;
    submitText: string;
}>();

// 2. EMITS: Define the event sent when the form is submitted
const emit = defineEmits<{
    (e: 'submitForm', payload: UserFormData): void
}>();

// 3. LOCAL STATE: Create a reactive, mutable copy of the prop data
const formState = ref<UserFormData>({ ...props.initialData });

// 4. WATCHER: Ensures the local formState updates if the parent's initialData prop changes
// This is crucial for switching between different users in 'edit' mode.
watch(
    () => props.initialData, 
    (newVal) => {
        if (newVal) {
            formState.value = { ...newVal };
        }
    }, 
    { deep: true, immediate: true }
);

// 5. FUNCTION: Handles form submission and cleans up the payload
const handleSubmit = () => {
    const payload = { ...formState.value };

    // Cleanup logic
    if (props.mode === 'edit') {
        // If in EDIT mode and password field is empty, delete it from the payload
        if (!payload.rawPassword) {
            delete payload.rawPassword;
        }
    }
    
    // Emit the final data to the parent view
    emit('submitForm', payload);
};
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="firstName">First Name:</label>
            <input id="firstName" v-model="formState.firstName" type="text" required>
        </div>

        <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input id="lastName" v-model="formState.lastName" type="text" required>
        </div>

        <div class="form-group">
            <label for="email">Email:</label>
            <input id="email" v-model="formState.email" type="email" required>
        </div>

        <div class="form-group" v-if="props.mode === 'create'">
            <label for="password">Password:</label>
            <input id="password" v-model="formState.rawPassword" type="password" required>
        </div>

        <div class="form-group">
            <label for="address">Delivery Address:</label>
            <input id="address" v-model="formState.deliveryAddress" type="text">
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