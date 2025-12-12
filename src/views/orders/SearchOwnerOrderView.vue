<script setup lang="ts">
import { useDateFormatter } from '@/composables/useDateFormatter';
import { useOrders, type Order } from '@/composables/useOrders';
import { useUsers } from '@/composables/useUsers';
import { OrdersInjectionKey } from '@/keys/order-keys';
import { computed, inject, onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';

// ======================
// Declare constants
// ======================

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

const dataFromParent = ref(false);

// =========================================================
// Inject states shared from parent (orders from search)
// But only update if there is new data from the parent
// =========================================================

const injectedOrdersRef = inject(OrdersInjectionKey) as Ref<Order[] | null> | undefined;

const ordersToDisplay = computed<Order[]>(() => { // List that rellies on the injected state

    if(injectedOrdersRef?.value) {
        dataFromParent.value = true;
        return injectedOrdersRef.value;
    }

    dataFromParent.value = false;    
    return ordersByOwner.value;
});

// =============================
// Functions that calls API
// =============================

const loadUser = (id: string) => {
    fetchUserById(parseInt(id));
}

const loadOrders = (owner: string) => {
    fetchOrdersByOwner(owner, null);
}

onMounted(() => {
    loadUser(route.params.ownerId as string);

    loadOrders(route.params.ownerId as string);  
});

</script>

<template>
    <div v-if="currentUser?.id == undefined">
        Issuer ID was not provided or is invalid.
    </div>
    <div v-else>
        <h2>All Orders from Issuer "{{ currentUser?.firstName }} {{ currentUser?.lastName }}"</h2>

        <p v-if="ordersLoading">Loading data from user's orders...</p>
        <p v-else-if="ordersError">Error: {{ ordersError }}</p>

        <p v-else-if="ordersToDisplay.length == 0 && dataFromParent">
            No orders from the user were found in the date range provided.
        </p>

        <p v-else-if="ordersToDisplay.length == 0">
            This user hasn't made any orders.
        </p>
        <table class="info-table" v-else>
            <tr>
                <td width="20%">ID</td>
                <td width="20%">Issue date</td>
                <td width="50">Issuer</td>
                <td width="10%" align="center">See details</td>
            </tr>
            <tr v-for="order in ordersToDisplay" :key="order.id">
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