<script setup lang="ts">
import { useDateFormatter } from '@/composables/useDateFormatter';
import { useOrders } from '@/composables/useOrders';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const { currentOrder, loading, error, fetchOrderById } = useOrders();
const { formatDate } = useDateFormatter();

// Function that calls APi
const loadOrder = (id: string) => {
    fetchOrderById(parseInt(id));
};

onMounted(() => {
    loadOrder(route.params.id as string)
});

// Watch for changes in the route parameter (if the user navigates to another page)
watch(
    () => route.params.id,
    (newId) => {
        if(newId) {
            loadOrder(newId as string);
        }
    }
);
</script>

<template>

    <!-- Loading div -->
    <div v-if="loading">
        Loading order information...
    </div>

    <!-- Error div -->
    <div v-else-if="error">
        Error: {{ error }}
    </div>

    <!-- Data div -->    
    <div v-else-if="currentOrder">
        <h2>Data from Order # {{ currentOrder.id }}</h2>
        
        <ul>
            <li>
                ID: {{ currentOrder.id }}
            </li>
            <li>
                Issued on {{ formatDate(currentOrder.issueDate) }}
            </li>
            <li>
                Issued by: {{ currentOrder.orderOwner.firstName }} {{ currentOrder.orderOwner.lastName }}
            </li>
            <li>
                Products ordered:
                <ul v-for="product in currentOrder.orderProducts">
                    <li>{{ product.productName }} (# {{ product.id }})</li>
                </ul>
            </li>
        </ul>

        <div style="margin-top: 50px;">
            <p>
                <RouterLink :to="{ name: 'order-edit', params: { id: currentOrder.id } }" title="Edit order information">
                    <img src="@/assets/edit.png" width="15" height="15" /> Edit information
                </RouterLink>
            </p>
            <p>
                <RouterLink :to="{ name: 'order-delete', params: { id: currentOrder.id } }" title="Delete this user">
                    <img src="@/assets/delete.png" width="15" height="15" /> Delete order
                </RouterLink>
            </p>
        </div>        
    </div>

    <!-- No param div -->
    <div v-else>
        No user selected.
    </div>

</template>