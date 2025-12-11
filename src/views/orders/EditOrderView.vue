<script setup lang="ts">
import OrderForm from '@/components/OrderForm.vue';
import { type BasicOrderData, type Order, useOrders } from '@/composables/useOrders';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const router    = useRouter();
const route     = useRoute();
const { currentOrder, fetchOrderById, editOrder, loading, error } = useOrders();

// Define the empty data object passed to the form
const initialFormState = ref<BasicOrderData>({
    orderOwner: null,
    orderProducts: [],
});

const loadOrder = (id: string | string[] | undefined) => {
    // Check for "undefined" (or null)
    if(!id) {
        // Handle case where ID is missing
        console.error("No ID found in route parameters.");
        return;
    }

    let orderIdString: string;

    // Check whether it is an array and, if so, use only the first one
    if(Array.isArray(id)) {
        orderIdString = id[0]!;
    } else {
        orderIdString = id;
    }

    // Turn into int (number)
    const orderId = parseInt(orderIdString);

    if(!isNaN(orderId)){
        fetchOrderById(orderId);
    }
}

watch(currentOrder, (order) => {
    if(order) {
        initialFormState.value = {
            id: order.id,
            orderOwner: order.orderOwner ? order.orderOwner.id : null,
            orderProducts: order.orderProducts.map(product => product.id)
        }
    }
}, { immediate: true });

const handleUpdate = async (formData: BasicOrderData) => {
    // Simple client-side validation
    if (!formData.orderOwner) {
        alert("There must be an issuer.");
        return;
    }

    // Call the composable
    const success = await editOrder(formData as BasicOrderData);

    if(success) {
        alert("Order updated successfully!");
        router.push({
            name: 'order-info',
            params: { id: formData.id }
        });
    }
};

onMounted(() => {
    loadOrder(route.params.id);
});

watch(() => route.params.id, (newId) => {
    if(newId) {
        loadOrder(newId);
    }
});
</script>

<template>
    <div>
        <h2>Edit order</h2>

        <OrderForm 
            mode="edit" 
            :initial-data="initialFormState" 
            :loading="loading" 
            :error="error" 
            submit-text="Edit order" 
            @submit-form="handleUpdate"
        />
    </div>
</template>