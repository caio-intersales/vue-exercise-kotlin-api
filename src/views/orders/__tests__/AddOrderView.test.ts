import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref } from 'vue';
import AddOrderView from '../AddOrderView.vue';
import OrderForm from '@/components/OrderForm.vue';
import type { BasicOrderData, Order } from '@/composables/useOrders';
import type { Product } from '@/composables/useProducts';

// --- MOCK DATA ---
const mockOrderOwnerUser = {
    id: 5,
    firstName: 'Order',
    lastName: 'Owner',
    email: 'owner@example.com',
    deliveryAddress: 'Main St'
};

const mockOrderData: BasicOrderData = {
    orderOwner: 5, // User ID 5
    orderProducts: [1, 2, 5]
};

const mockProductData: Product = {
    id: 1,
    productName: 'Laptop One',
    productType: 1,
    productPrice: 10,
    productQnt: 10
}

const mockCreatedOrder: Order = {
    orderOwner: mockOrderOwnerUser,
    orderProducts: [mockProductData, mockProductData],
    id: 42, // Simulate the ID assigned by the backend
    issueDate: '2025-12-11T16:00:00Z'
};

// --- MOCK DEPENDENCIES STATE ---
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
// Define the exact function signature for type safety
type OrderResult = Order | undefined; 
type CreateOrderFn = (data: BasicOrderData) => Promise<OrderResult>;

// Default: Assume successful creation
const mockCreateOrder: Mock<CreateOrderFn> = vi.fn(
    (data: BasicOrderData) => Promise.resolve(mockCreatedOrder)
); 

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useOrders', () => ({
    useOrders: () => ({
        createOrder: mockCreateOrder,
        loading: mockLoading,
        error: mockError,
    }),
}));

// --- MOCK ROUTER ---
const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockRouterPush }),
}));

// --- UTILITY/SETUP ---
// Factory function for mounting with shallow mount
const createWrapper = () => mount(AddOrderView, {
    global: {
        // Shallow mount stubs the OrderForm component
        stubs: { OrderForm: true }, 
    },
});

describe('AddOrderView.vue', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockLoading.value = false;
        mockError.value = null;
        mockCreateOrder.mockClear();
        mockRouterPush.mockClear();

        // Spy on window.alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Rendering
    // ===============================================
    it('renders the OrderForm component with correct initial props', () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);

        expect(orderForm.exists()).toBe(true);
        expect(orderForm.props('mode')).toBe('create');
        expect(orderForm.props('submitText')).toBe('Create a new order');

        // Check the structure of initial data
        const initialData = orderForm.props('initialData');
        expect(initialData).toEqual({
            orderOwner: 0,
            orderProducts: []
        });

        wrapper.unmount();
    });

    // ===============================================
    // 2. Successful Submission Flow
    // ===============================================
    it('handles successful form submission, alerts, and redirects', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);
        
        // 1. Simulate the form component emitting the submit-form event
        orderForm.vm.$emit('submit-form', mockOrderData);
        
        // Wait for the async createOrder call to resolve
        await nextTick(); 

        // 2. Assert API was called correctly
        expect(mockCreateOrder).toHaveBeenCalledTimes(1);
        expect(mockCreateOrder).toHaveBeenCalledWith(mockOrderData);

        // 3. Assert success alert was shown
        expect(window.alert).toHaveBeenCalledWith(
            "Order was succesfully added! You'll be redirecteed to the order's page."
        );

        // 4. Assert redirection to the new order's info page
        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'order-info',
            params: { id: mockCreatedOrder.id }
        });

        wrapper.unmount();
    });

    // ===============================================
    // 3. Client-Side Validation
    // ===============================================
    it('prevents submission and alerts if orderOwner is missing (0)', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);
        
        // Simulate payload with missing owner (owner 0 is treated as missing/invalid)
        const invalidData: BasicOrderData = {
            orderOwner: 0, // Missing owner
            orderProducts: mockOrderData.orderProducts
        };
        
        // 1. Simulate the form component emitting the submit-form event
        orderForm.vm.$emit('submit-form', invalidData);
        
        // Wait for the synchronous validation check
        await nextTick(); 

        // 2. Assert API was NOT called
        expect(mockCreateOrder).not.toHaveBeenCalled();

        // 3. Assert client-side validation alert was shown
        expect(window.alert).toHaveBeenCalledWith("Orders must have an issuer.");
        
        // 4. Assert no redirection occurred
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
    
    // ===============================================
    // 4. API Failure Handling
    // ===============================================
    it('does not alert success or redirect on API failure', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);

        // Mock the API to return failure (undefined)
        mockCreateOrder.mockResolvedValue(undefined); 
        
        // 1. Simulate form submission with valid data
        orderForm.vm.$emit('submit-form', mockOrderData);
        
        // Wait for the async createOrder call to resolve
        await nextTick(); 

        // 2. Assert API was called
        expect(mockCreateOrder).toHaveBeenCalledTimes(1);

        // 3. Assert no success alert or redirection occurred
        expect(window.alert).not.toHaveBeenCalled(); 
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
});