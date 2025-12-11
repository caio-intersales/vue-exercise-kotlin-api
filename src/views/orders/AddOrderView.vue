<script setup lang="ts">
import OrderForm from '@/components/OrderForm.vue';
import { type BasicOrderData, useOrders } from '@/composables/useOrders';
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const { createOrder, loading, error } = useOrders();

// Define the empty data object passed to the form
const initialFormState = ref<BasicOrderData>({
    orderOwner: 0,
    orderProducts: []
});

// Receives the cleaned data from OrderForm and calls the API
const handleSubmit = async (formData: BasicOrderData) => {
    // Simple client-side validation
    if(!formData.orderOwner){
        alert("Orders must have an issuer.");
        return;
    }

    // Cast the payload to FormInputData
    const createdOrder = await createOrder(formData as BasicOrderData);

    if(createdOrder) {
        alert("Order was succesfully added! You'll be redirecteed to the order's page.")
        router.push({
            name: 'order-info',
            params: { id: createdOrder.id }
        });
    }
};
</script>

<template>
    <div>
        <h2>Add new order</h2>

        <OrderForm
            mode="create"
            :initial-data="initialFormState"
            :loading="loading"
            :error="error"
            submit-text="Create a new order"
            @submit-form="handleSubmit"
        />
    </div>
</template>