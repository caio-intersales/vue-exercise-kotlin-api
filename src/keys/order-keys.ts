import type { Order } from "@/composables/useOrders";
import type { InjectionKey, Ref } from "vue";

export const OrdersInjectionKey: InjectionKey<Ref<Order[] | null>> = Symbol('orders-data');