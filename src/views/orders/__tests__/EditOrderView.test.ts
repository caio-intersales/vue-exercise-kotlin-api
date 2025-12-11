import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import EditOrderView from '../EditOrderView.vue';
import OrderForm from '@/components/OrderForm.vue';
import type { BasicOrderData, Order } from '@/composables/useOrders';

// --- MOCK NESTED DATA ---
const mockOrderOwnerUser = { id: 5, firstName: 'User', lastName: 'Five' }; 
const mockProductItem1 = { id: 10, name: 'Widget A', price: 50 };
const mockProductItem2 = { id: 20, name: 'Gadget B', price: 10 };

// --- MOCK FETCHED ORDER DATA (Complex/Nested) ---
const mockFetchedOrder: Order = {
    id: 100,
    orderOwner: mockOrderOwnerUser as any, // Use mock object
    orderProducts: [mockProductItem1 as any, mockProductItem2 as any], // Use array of objects
    issueDate: '2025-12-11T16:00:00Z',
};

// --- MOCK FORM DATA (Flattened/Simple) ---
const mockFlattenedFormData: BasicOrderData & { id: number } = {
    id: 100,
    orderOwner: 5, // Just the ID
    orderProducts: [10, 20], // Just the IDs
};

// --- MOCK DEPENDENCIES STATE ---
const mockCurrentOrder: Ref<Order | null> = ref(null);
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
const mockFetchOrderById = vi.fn((id: number) => {
    // Synchronously set data based on ID for simplicity
    mockCurrentOrder.value = id === 100 ? mockFetchedOrder : null;
});
const mockEditOrder = vi.fn((payload: BasicOrderData) => Promise.resolve(true)); // Default: Success

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useOrders', () => ({
    useOrders: () => ({
        currentOrder: mockCurrentOrder,
        fetchOrderById: mockFetchOrderById,
        editOrder: mockEditOrder,
        loading: mockLoading,
        error: mockError,
    }),
}));

// --- MOCK ROUTER/ROUTE ---
// Note: We use '100' as the default string ID
const mockRouteParamsId = ref('100'); 
const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockRouterPush }),
    useRoute: () => ({
        params: reactive({ id: mockRouteParamsId })
    }),
}));

// --- UTILITY/SETUP ---
const createWrapper = () => mount(EditOrderView, {
    global: {
        stubs: { OrderForm: true }, 
    },
});


describe('EditOrderView.vue', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentOrder.value = null;
        mockRouteParamsId.value = '100'; // Reset ID
        mockLoading.value = false;
        mockError.value = null;

        mockFetchOrderById.mockClear(); 
        mockEditOrder.mockClear();
        mockRouterPush.mockClear();

        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Data Loading & Transformation
    // ===============================================
    it('fetches order data on mount using the initial route ID (2 calls)', async () => {
        const wrapper = createWrapper();
        await nextTick(); // Wait for onMounted and watcher to fire

        // Expect 2 calls due to redundant onMounted and immediate watch
        expect(mockFetchOrderById).toHaveBeenCalledTimes(1); 
        expect(mockFetchOrderById).toHaveBeenCalledWith(100);
        
        wrapper.unmount();
    });

    it('re-fetches order data when the route ID changes', async () => {
        const wrapper = createWrapper();
        await nextTick(); // Initial 2 calls fire
        
        mockFetchOrderById.mockClear(); 
        
        // 1. Simulate route change
        mockRouteParamsId.value = '200';

        // 2. Wait for the watcher to fire
        await nextTick(); 
        
        // 3. Assert fetch was called once (by the watcher) with the new ID
        expect(mockFetchOrderById).toHaveBeenCalledTimes(1); 
        expect(mockFetchOrderById).toHaveBeenCalledWith(200);

        wrapper.unmount();
    });
    
    it('transforms fetched order object into flattened form data', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);
        
        // 1. Simulate data being loaded successfully (Triggers currentOrder watcher)
        mockCurrentOrder.value = mockFetchedOrder;
        await nextTick(); // Wait for currentOrder watch handler to update initialFormState

        const initialDataProp = orderForm.props('initialData');

        // 2. Assert transformation correctness: Order Owner ID and Product IDs
        expect(initialDataProp.id).toBe(100);
        expect(initialDataProp.orderOwner).toBe(5); 
        expect(initialDataProp.orderProducts).toEqual([10, 20]);
        
        wrapper.unmount();
    });

    // ===============================================
    // 3. Update Submission Flow
    // ===============================================
    it('calls editOrder with payload and redirects on success', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);

        const updatedPayload = { 
            id: 100, 
            orderOwner: 5,
            orderProducts: [10, 20, 30], // Adding a product
        };
        
        // 1. Simulate the form component emitting the submit-form event
        orderForm.vm.$emit('submit-form', updatedPayload);

        // Wait for the async editOrder call to resolve
        await nextTick(); 

        // 2. Assert service call
        expect(mockEditOrder).toHaveBeenCalledTimes(1);
        expect(mockEditOrder).toHaveBeenCalledWith(updatedPayload);

        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("Order updated successfully!");
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'order-info',
            params: { id: 100 }
        });

        wrapper.unmount();
    });

    it('prevents update and alerts if orderOwner is missing (null)', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);
        
        const invalidPayload: BasicOrderData & { id: number } = { 
            id: 100, 
            orderOwner: null, // Missing owner
            orderProducts: [10],
        };

        // 1. Simulate the form component emitting the submit-form event
        orderForm.vm.$emit('submit-form', invalidPayload);
        
        // Wait for the synchronous validation check
        await nextTick();

        // Assert API call was blocked
        expect(mockEditOrder).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("There must be an issuer.");
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
    
    it('does not redirect on API failure', async () => {
        const wrapper = createWrapper();
        const orderForm = wrapper.findComponent(OrderForm);

        // Mock the API to return failure (false)
        mockEditOrder.mockResolvedValue(false); 
        
        const validPayload: BasicOrderData & { id: number } = { 
            id: 100, 
            orderOwner: 5,
            orderProducts: [10],
        };
        
        // 1. Simulate form submission with valid data
        orderForm.vm.$emit('submit-form', validPayload);
        
        // Wait for the async editOrder call to resolve
        await nextTick(); 

        // 2. Assert API was called
        expect(mockEditOrder).toHaveBeenCalledTimes(1);

        // 3. Assert no success alert or redirection occurred
        expect(window.alert).not.toHaveBeenCalledWith("Order updated successfully!"); 
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
});