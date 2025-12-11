// DeleteProductView.test.ts

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import DeleteProductView from '../DeleteProductView.vue';
import type { Product } from '@/composables/useProducts';

// --- MOCK DATA ---
const mockProduct: Product = {
    id: 10,
    productName: 'Widget Alpha',
    productType: 2,
    productPrice: 50.99,
    productQnt: 100
};

// --- MOCK DEPENDENCIES STATE ---
const mockCurrentProduct: Ref<Product | null> = ref(null);
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
const mockFetchProductById = vi.fn((id: number) => {
    // Synchronously set data based on ID for simplicity
    mockCurrentProduct.value = id === 10 ? mockProduct : null;
});
const mockDeleteProduct = vi.fn(() => Promise.resolve(true)); // Default: Success

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useProducts', () => ({
    useProducts: () => ({
        currentProduct: mockCurrentProduct,
        loading: mockLoading,
        error: mockError,
        fetchProductById: mockFetchProductById,
        deleteProduct: mockDeleteProduct,
    }),
}));

// --- MOCK ROUTER/ROUTE ---
const mockRouteParamsId = ref('10'); // Start with a valid ID
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
// Factory function for mounting
const createWrapper = () => mount(DeleteProductView, {
    global: {
        // No stubs needed
    },
});

describe('DeleteProductView.vue', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCurrentProduct.value = null;
        mockRouteParamsId.value = '10';
        mockLoading.value = false;
        mockError.value = null;

        // Mock window functions (alert/confirm)
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        // Default confirm to TRUE (user clicks OK)
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        mockFetchProductById.mockClear();
        mockDeleteProduct.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Data Loading & Display States
    // ===============================================
    it('fetches product data on mount and displays deletion confirmation', async () => {
        const wrapper = createWrapper();
        await nextTick();
        
        // Assert fetch was called twice (onMounted + initial watcher run)
        expect(mockFetchProductById).toHaveBeenCalledTimes(1);
        expect(mockFetchProductById).toHaveBeenCalledWith(10);
        
        // Simulate data load
        mockCurrentProduct.value = mockProduct;
        await nextTick();

        // Assert product data is displayed
        const header = wrapper.find('h2').text();
        expect(header).toContain('Widget Alpha');
        expect(header).toContain('ID # 10');
        expect(wrapper.find('.delete-button').exists()).toBe(true);
        
        wrapper.unmount();
    });

    it('displays loading state while data is being fetched', async () => {
        mockLoading.value = true;
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('Loading product...');
        expect(wrapper.find('h2').exists()).toBe(false);

        wrapper.unmount();
    });

    it('displays error message if fetch fails', async () => {
        mockError.value = 'Product not found.';
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('Product could not be loaded.');
        expect(wrapper.find('h2').exists()).toBe(false);

        wrapper.unmount();
    });
    
    it('re-fetches product data when the route ID changes', async () => {
        const wrapper = createWrapper();
        await nextTick(); // Initial 2 calls fire
        
        // Clear history to isolate the watcher effect
        mockFetchProductById.mockClear(); 
        
        // 1. Simulate route change
        mockRouteParamsId.value = '20';

        // 2. Wait for the watcher to fire
        await nextTick(); 
        
        // 3. Assert fetch was called once (by the watcher) with the new ID
        expect(mockFetchProductById).toHaveBeenCalledTimes(1); 
        expect(mockFetchProductById).toHaveBeenCalledWith(20);

        wrapper.unmount();
    });


    // ===============================================
    // 2. Deletion Flow
    // ===============================================
    it('successfully deletes product and redirects to all-products page', async () => {
        mockCurrentProduct.value = mockProduct;
        const wrapper = createWrapper();
        await nextTick();
        await nextTick(); // Ensure button is rendered

        // Click the delete button
        await wrapper.find('.delete-button').trigger('click');
        
        // 1. Assert confirmation was shown
        expect(window.confirm).toHaveBeenCalledWith(
            "Do you want to permanently delete Widget Alpha (ID 10)? This cannot be undone."
        );
        
        // 2. Assert API call happened (since confirm is mocked to return true)
        expect(mockDeleteProduct).toHaveBeenCalledTimes(1);
        expect(mockDeleteProduct).toHaveBeenCalledWith(10);
        
        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("The product was successfully deleted.");
        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'all-products' });

        wrapper.unmount();
    });

    it('cancels deletion when user clicks no/cancel', async () => {
        mockCurrentProduct.value = mockProduct;
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
        expect(mockDeleteProduct).not.toHaveBeenCalled();
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    it('shows error alert if deleteProduct API call fails', async () => {
        mockCurrentProduct.value = mockProduct;
        
        // Ensure initial error state is clear for mounting
        mockError.value = null;

        // Mock deleteProduct to return failure and set the error state
        mockDeleteProduct.mockImplementation(async (...args: any[]) => { // Use ...args to match any possible signature
            // Simulate API failure and set the error state like the real composable would
            mockError.value = 'Database constraint error.'; 
            return false;
        });
        
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();

        // 1. Click the delete button and confirm
        await wrapper.find('.delete-button').trigger('click');
        
        // 2. Wait for the async deleteProduct call and the error state to update
        await nextTick(); 
        
        // 3. Assert API call happened
        expect(mockDeleteProduct).toHaveBeenCalledTimes(1);
        
        // 4. Assert failure alert was shown using the error message
        expect(window.alert).toHaveBeenCalledWith("Deletion: failed Database constraint error.");
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    // ===============================================
    // 3. Navigation
    // ===============================================
    it('calls router.back() when cancel button is clicked', async () => {
        mockCurrentProduct.value = mockProduct;
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();
        
        // Find and click the 'Cancel' button (it's the second button)
        await wrapper.findAll('button')[1]!.trigger('click');
        
        expect(mockRouterBack).toHaveBeenCalledTimes(1);
        
        wrapper.unmount();
    });
});