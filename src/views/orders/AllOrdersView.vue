<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useDateFormatter } from '@/composables/useDateFormatter';

// Get the data and function from the composable
const { allOrders, loading, error, fetchAllOrders } = useOrders();

// Call the Date Formatter
const { formatDate } = useDateFormatter();

// Call the fetch function when the component is mounted
onMounted(() => {
    fetchAllOrders();
});
</script>

<template>
    <div>
        <h2>All Orders</h2>

        <p v-if="loading">Loading order data...</p>
        <p v-else-if="error">Error: {{ error }}</p>

        <p v-else-if="allOrders.length == 0">
            There are no users in the system yet :/
        </p>
        <table class="info-table" v-else>
            <tr>
                <td width="20%">ID</td>
                <td width="20%">Issue date</td>
                <td width="50">Issuer</td>
                <td width="10%" align="center">See details</td>
            </tr>
            <tr v-for="order in allOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ formatDate(order.issueDate) }}</td>
                <td>
                    <span v-if="order.orderOwner.firstName">
                        {{ order.orderOwner.firstName }} {{ order.orderOwner.lastName }}
                    </span>
                    <span v-else><i>No name provided</i></span>
                </td>
                <td align="center">
                    <RouterLink :to="{ name: 'order-info', params: { id: order.id} }" title="Open order information"><img src="@/assets/see.png" width="20" /></RouterLink>
                </td>
            </tr>
        </table>
    </div>
</template>