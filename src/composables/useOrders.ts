
import { ref } from "vue";
import type { Product } from "./useProducts";
import type { User } from "./useUsers";

// ==================================
// Interfaces
// ==================================

export interface Order {
    id: number;
    orderOwner: User;
    orderProducts: Product[];
    issueDate: string;
}

export interface BasicOrderData {
    orderOwner: number;
    orderProducts: Product[];
}

export interface UpdateOrder extends BasicOrderData {
    id: number;
}

// ==================================
// Variables
// ==================================

const allOrders         = ref<Order[]>([]);
const currentOrder      = ref<Order | null>(null);
const loading           = ref(false);
const error             = ref<string | null>(null);

const apiUrl            = import.meta.env.VITE_BASE_API_URL;

// ==================================
// "Service" part
// ==================================

export function useOrders() {

    /**
     * Function to fetch all orders from API
     */
    const fetchAllOrders = async () => {
        loading.value   = true;
        error.value     = null;

        try {
            const response = await fetch(`${apiUrl}/orders/list`);
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}.`)
            }

            const data: Order[] = await response.json();
            allOrders.value = data;
        } catch (err: any) {
            console.error(err);
            error.value = err.message || 'Failed to fetch orders.';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to fetch a specific order from API based on their ID
     */
    const fetchOrderById = async (id: number) => {
        loading.value   = true;
        error.value     = null;
        currentOrder.value = null;

        try {
            const response = await fetch(`${apiUrl}/orders/show/${id}`);

            if(!response.ok) {
                throw new Error(`Order not found or API error (${response.status}).`);
            }

            const data: Order = await response.json();
            currentOrder.value = data;
        } catch (err: any) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to create a new order sending a BasicOrderData obj using POST
     */
    const createOrder = async (newOrder: BasicOrderData) => {
        loading.value       = true;
        error.value         = null;
        currentOrder.value  = null;

        try {
            const response = await fetch(`${apiUrl}/orders/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newOrder)
            });

            // Look for positive status
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(`Failed to create a new order. Status: ${response.status}.`);
            }

            // The API returns then the created order, including the generated ID
            const createdOrder: Order = await response.json();

            // Sucess feedback
            return createdOrder;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        };
    }

    /**
     * Function to edit an existing order sending a Order obj using PUT
     */
    const editOrder = async (order: Order) => {
        loading.value       = true;
        error.value         = null;
        currentOrder.value  = null;

        try {
            const response = await fetch(`${apiUrl}/orders/edit`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order)
            });

            // Look for positive status
            if (response.status !== 200) {
                throw new Error(`Failed to update the order. Status: ${response.status}.`);
            }

            // The API then returns the updated order
            const updatedOrder: Order = await response.json();

            return updatedOrder;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to delete an order based on its ID using DELETE
     */
    const deleteOrder = async (id: number) => {
        loading.value   = true;
        error.value     = null;
        currentOrder.value   = null;

        try {
            const response = await fetch(`${apiUrl}/orders/delete/${id}`, {
                method: 'DELETE'
            });

            // Look for a positive status
            if (response.status !== 204 && response.status !== 200) {
                throw new Error(`Failed to delete the order. Status: ${response.status}.`);
            }

            return true;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Return the reactive data and functions to use in the component
    return {
        allOrders,
        currentOrder,
        loading,
        error,
        fetchAllOrders,
        fetchOrderById,
        createOrder,
        editOrder,
        deleteOrder,
    }
}
