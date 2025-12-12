<script setup lang="ts">
import { useDateFormatter } from '@/composables/useDateFormatter';
import { useOrders } from '@/composables/useOrders';
import { useUsers } from '@/composables/useUsers';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();

const {
    currentUser,
    loading: userLoading,
    error: userError,
    fetchUserById
} = useUsers();

const {
    ordersByOwner,
    loading: ordersLoading,
    error: ordersError,
    fetchOrdersByOwner
} = useOrders();

const { formatDate } = useDateFormatter();

// Functions that calls API

const loadUser = (id: string) => {
    fetchUserById(parseInt(id));
}

const loadOrders = (owner: string) => {
    fetchOrdersByOwner(parseInt(owner), null);
}

// Define a variable to advise about not triggering loadOrders, when no User ID is provided
let canShowOrders = false;

onMounted(() => {
    loadUser(route.params.ownerId as string);

    loadOrders(route.params.ownerId as string);  
});
</script>

<template>
    <div>
        <h2>All Orders from Issuer "{{ currentUser?.firstName }} {{ currentUser?.lastName }}"</h2>

        <p v-if="ordersLoading">Loading data from user's orders...</p>
        <p v-else-if="ordersError">Error: {{ ordersError }}</p>

        <p v-else-if="canShowOrders">Issuer ID was not provided.</p>

        <p v-else-if="ordersByOwner.length == 0">
            This user hasn't made any orders.
        </p>
        <table class="info-table" v-else>
            <tr>
                <td width="20%">ID</td>
                <td width="20%">Issue date</td>
                <td width="50">Issuer</td>
                <td width="10%" align="center">See details</td>
            </tr>
            <tr v-for="order in ordersByOwner" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ formatDate(order.issueDate) }}</td>
                <td>
                    <span v-if="order.orderOwner.firstName">
                        {{ order.orderOwner.firstName }} {{ order.orderOwner.lastName }}
                    </span>
                    <span v-else><i>No name provided</i></span>
                </td>
                <td align="center">
                    <RouterLink
                    :to="{ name: 'order-info', params: { id: order.id} }"
                    title="Open order information">
                        <img src="@/assets/see.png" width="20" />
                    </RouterLink>
                </td>
            </tr>
        </table>
    </div>
</template>