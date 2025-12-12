<script setup lang="ts">
import DateForm from '@/components/DateForm.vue';
import { useOrders, type Order, type OrderDataByDate } from '@/composables/useOrders';
import { OrdersInjectionKey } from '@/keys/order-keys';
import { provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { fetchOrdersByOwner, fetchOrdersByDate } = useOrders();

let loading = false;
let error = "";

// Define the empty data object passed to the form
const initialFormState = ref<OrderDataByDate>({
    startDate: null,
    endDate: null,
});

// Making the searchType reactive with ref
const searchType = ref("general"); // Initialise it with a default value

// Define the names of the child route that would need a "specific" research
const specificSearchName = "order-search-owner";

// Define the ID for access in the parent view
const currentOwnerId = ref(route.params.ownerId);

// Define a reactive state to hold the data from searches that will be accessible for children
// Then provide the state to the descendents, making it accessible
const externalOrders = ref<Order[] | null>(null);
provide(OrdersInjectionKey, externalOrders);

// Watch for changes in the route name (page change)
watch(() => route.name, (newName) => {
    // Check if the current route name is the specific search route
    if (newName == specificSearchName) {
        searchType.value = "specific";
    } else {
        searchType.value = "general";
    }
}, { immediate: true });

// Watch for changes in the ID (user or page change)
watch(() => route.params.ownerId, (newId) => {
    currentOwnerId.value = newId;
});

// Function to handleSubmit
const handleSubmit = async (formData: OrderDataByDate) => {

    let success: boolean = false;
    let fetchedData: Order[] | null = null;
    
    // Call the right composable
    if(searchType.value == "general") {
        fetchedData = await fetchOrdersByDate(formData as OrderDataByDate);
    } else {
        fetchedData = await fetchOrdersByOwner(currentOwnerId.value as string, formData as OrderDataByDate);
    }

    externalOrders.value = fetchedData;

    if(!fetchedData) {
        alert("The request failed.")
    }
}
</script>

<template>
    <DateForm
        :mode="searchType"
        :initial-data="initialFormState"
        :loading="loading"
        :error="error"
        submit-text="Search"
        @submit-form="handleSubmit"
    />
    
    <RouterView />
</template>