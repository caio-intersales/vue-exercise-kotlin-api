<script setup lang="ts">
import type { OrderDataByDate } from '@/composables/useOrders';
import { ref, watch } from 'vue';

// Define what is needed when calling the form
const props = defineProps<{
    mode: string;
    initialData: OrderDataByDate;
    loading: boolean;
    error: string | null;
    submitText: string;
}>();

// Define the event that's supposed to be sent when the form is submitted
const emit = defineEmits<{
    (e: 'submitForm', payload: OrderDataByDate): void
}>();

// Create a reactive, mutable copy of the prop data
const formState = ref<OrderDataByDate>({ ...props.initialData });

// Watch for updates in the parent
watch(
    () => props.initialData,
    (newVal) => {
        if(newVal) {
            formState.value = { ...newVal };
        }
    },
    { deep: true, immediate: true }
);

// Handles the submission of the form
const handleSubmit = () => {
    const payload = { ...formState.value };

    // Emite the final data to the parent view
    emit('submitForm', payload);
};
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <div class="date-form">
            <div>
                <label for="startDate">Start date: </label> <input id="startDate" v-model="formState.startDate" type="date" />
            </div>
            <div>
                <label for="endDate">End date: </label> <input id="endDate" v-model="formState.endDate" type="date" />
            </div>
            <div>
                <button type="submit" :disabled="props.loading">
                    {{ props.loading ? 'Processing...' : props.submitText }}
                </button>
            </div>
        </div>
        <p v-if="props.error" class="error-message">
            Error: {{ props.error }}
        </p>
    </form>
</template>