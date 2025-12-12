<script setup lang="ts">
import { useDateFormatter } from '@/composables/useDateFormatter';
import { useOrders, type Order } from '@/composables/useOrders';
import { EndDateKey, OrdersInjectionKey, SearchAttemptedKey, StartDateKey } from '@/keys/order-keys';
import { computed, inject, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';


// ======================
// Declare constants
// ======================

const route = useRoute();

const { formatDate, formatOnlyDate } = useDateFormatter();

const dataFromParent = ref(false);

// =========================================================
// Inject states shared from parent (orders from search)
// But only update if there is new data from the parent
// =========================================================

const injectedOrdersRef     = inject(OrdersInjectionKey) as Ref<Order[] | null> | undefined;
const searchAttemptedRef    = inject(SearchAttemptedKey) as Ref<boolean> | undefined;
const currentStartDateRef   = inject(StartDateKey) as Ref<string | null> | undefined;
const currentEndDateRef     = inject(EndDateKey) as Ref<string | null> | undefined;

// ==================================
// Compute the References injected
// ==================================

const ordersToDisplay = computed<Order[]>(() => {
    return injectedOrdersRef?.value || [];
});

const searchAttempted = computed(() => searchAttemptedRef?.value ?? false);

const dateRangeDisplay = computed(() => {
    const start = currentStartDateRef?.value;
    const end   = currentEndDateRef?.value;

    if(start && end) {
        return ` between ${formatOnlyDate(start)} and ${formatOnlyDate(end)}`
    } else if(start) {
        return ` from ${formatOnlyDate(start)} onwards`
    } else if(end) {
        return ` up to ${formatOnlyDate(end)}`
    }
    return '';
})

</script>

<template>
    <div v-if="!searchAttempted || (currentStartDateRef == undefined && currentEndDateRef == undefined)">
        Please, enter a start or end date to search for orders.
    </div>
    <div v-else>
        <p v-if="ordersToDisplay.length == 0">
            No orders were found in the date range provided.
        </p>
        <div v-else>
            Showing orders {{ dateRangeDisplay }}
            <table class="info-table">
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
    </div>
</template>