import type { Order } from "@/composables/useOrders";
import type { InjectionKey, Ref } from "vue";

// Key used to share orders retrieved by parent (SearchOrder.vue) with children
export const OrdersInjectionKey: InjectionKey<Ref<Order[] | null>> = Symbol('orders-data');

// Key used to share search attempts in the parent (SearchOrder.vue) with the children
export const SearchAttemptedKey: InjectionKey<Ref<boolean>> = Symbol('search-attempted-status');

// Keys used to share the values of the search in the parent (SearchOrder.vue) with the children
export const StartDateKey: InjectionKey<Ref<string | null>> = Symbol('start-date-filter');
export const EndDateKey: InjectionKey<Ref<string | null>> = Symbol('end-date-filter');