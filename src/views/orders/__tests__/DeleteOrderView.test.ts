// DeleteOrderView.test.ts

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import DeleteOrderView from '../DeleteOrderView.vue';
import type { Order } from '@/composables/useOrders';

// --- MOCK DATA ---
const mockOrder: Order = {
    id: 100,
    orderOwner: { id: 5, firstName: 'User', lastName: 'Five' } as any,
    orderProducts: [] as any,
    issueDate: '2025-12-11T16:00:00Z',
};

// --- MOCK DEPENDENCIES STATE ---
const mockCurrentOrder: Ref<Order | null> = ref(null);
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
const mockFetchOrderById = vi.fn((id: number) => {
    // Synchronously set data based on ID for simplicity
    mockCurrentOrder.value = id === 100 ? mockOrder : null;
});
const mockDeleteOrder = vi.fn(() => Promise.resolve(true)); // Default: Success

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useOrders', () => ({
    useOrders: () => ({
        currentOrder: mockCurrentOrder,
        loading: mockLoading,
        error: mockError,
        fetchOrderById: mockFetchOrderById,
        deleteOrder: mockDeleteOrder,
    }),
}));

// --- MOCK ROUTER/ROUTE ---
const mockRouteParamsId = ref('100'); // Start with a valid ID
const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ 
        push: mockRouterPush,
        back: mockRouterBack,
    }),
    useRoute: () => ({
        params: reactive({ id: mockRouteParamsId }),
    }),
}));

// --- UTILITY/SETUP ---
const createWrapper = () => mount(DeleteOrderView);

describe('DeleteOrderView.vue', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCurrentOrder.value = null;
        mockRouteParamsId.value = '100';
        mockLoading.value = false;
        mockError.value = null;

        // Mock window functions (alert/confirm)
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        // Default confirm to TRUE (user clicks OK)
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        mockFetchOrderById.mockClear();
        mockDeleteOrder.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Data Loading & Display States
    // ===============================================
    it('fetches order data on mount (2 calls) and displays confirmation', async () => {
        const wrapper = createWrapper();
        await nextTick();
        
        // Assert fetch was called twice (onMounted + initial watcher run)
        expect(mockFetchOrderById).toHaveBeenCalledTimes(1);
        expect(mockFetchOrderById).toHaveBeenCalledWith(100);
        
        // Simulate data load
        mockCurrentOrder.value = mockOrder;
        await nextTick();

        // Assert order data is displayed
        const header = wrapper.find('h2').text();
        expect(header).toContain('order # 100');
        expect(wrapper.find('.delete-button').exists()).toBe(true);
        
        wrapper.unmount();
    });

    it('displays loading state while data is being fetched', async () => {
        mockLoading.value = true;
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('Loading order...');
        expect(wrapper.find('h2').exists()).toBe(false);

        wrapper.unmount();
    });

    it('displays error message if fetch fails', async () => {
        mockError.value = 'Order not found.';
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('Order could not be loaded.');
        expect(wrapper.find('h2').exists()).toBe(false);

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


    // ===============================================
    // 2. Deletion Flow
    // ===============================================
    it('successfully deletes order and redirects to all-orders page', async () => {
        mockCurrentOrder.value = mockOrder;
        const wrapper = createWrapper();
        await nextTick();
        await nextTick(); // Ensure button is rendered

        // Click the delete button
        await wrapper.find('.delete-button').trigger('click');
        
        // 1. Assert confirmation was shown
        expect(window.confirm).toHaveBeenCalledWith(
            "Do you want to permanently delete order # 100? This cannot be undone."
        );
        
        // 2. Assert API call happened (since confirm is mocked to return true)
        expect(mockDeleteOrder).toHaveBeenCalledTimes(1);
        expect(mockDeleteOrder).toHaveBeenCalledWith(100);
        
        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("The order was successfully deleted.");
        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'all-orders' });

        wrapper.unmount();
    });

    it('cancels deletion when user clicks no/cancel', async () => {
        mockCurrentOrder.value = mockOrder;
        // Mock confirm to return FALSE (user clicks Cancel)
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();

        // Click the delete button
        await wrapper.find('.delete-button').trigger('click');
        
        // Assert confirmation was shown
        expect(window.confirm).toHaveBeenCalledTimes(1);
        
        // Assert API call was skipped
        expect(mockDeleteOrder).not.toHaveBeenCalled();
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    it('shows error alert if deleteOrder API call fails', async () => {
        mockCurrentOrder.value = mockOrder;
        mockError.value = null; // Ensure initial error state is clear

        // Mock deleteOrder to return failure and set the error state
        mockDeleteOrder.mockImplementation(async (...args: any[]) => {
            mockError.value = 'Database constraint error.'; 
            return false;
        });
        
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();

        // 1. Click the delete button and confirm
        await wrapper.find('.delete-button').trigger('click');
        
        // 2. Wait for the async deleteOrder call and the error state to update
        await nextTick(); 
        
        // 3. Assert API call happened
        expect(mockDeleteOrder).toHaveBeenCalledTimes(1);
        
        // 4. Assert failure alert was shown using the error message
        expect(window.alert).toHaveBeenCalledWith("Deletion: failed Database constraint error.");
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    // ===============================================
    // 3. Navigation
    // ===============================================
    it('calls router.back() when cancel button is clicked', async () => {
        mockCurrentOrder.value = mockOrder;
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();
        
        // Find and click the 'Cancel' button (it's the second button)
        await wrapper.findAll('button')[1]!.trigger('click');
        
        expect(mockRouterBack).toHaveBeenCalledTimes(1);
        
        wrapper.unmount();
    });
});