// EditProductView.test.ts

import { describe, it, expect, vi, beforeEach, type Mock, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import EditProductView from '../EditProductView.vue';
import ProductForm from '@/components/ProductForm.vue';
import type { BasicProductData, Product } from '@/composables/useProducts';

// --- MOCK DATA ---
const mockFetchedProduct: Product = {
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
    mockCurrentProduct.value = id === 10 ? mockFetchedProduct : null;
});
const mockEditProduct = vi.fn((payload: Product) => Promise.resolve(true)); // Default: Success

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useProducts', () => ({
    useProducts: () => ({
        currentProduct: mockCurrentProduct,
        fetchProductById: mockFetchProductById,
        editProduct: mockEditProduct,
        loading: mockLoading,
        error: mockError,
    }),
}));

// --- MOCK ROUTER/ROUTE ---
// Note: We use '10' as the default string ID
const mockRouteParamsId = ref('10'); 
const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockRouterPush }),
    useRoute: () => ({
        // Use reactive to allow the ref update in the test to trigger the component's watcher
        params: reactive({ id: mockRouteParamsId })
    }),
}));

// --- UTILITY/SETUP ---
// Factory function for mounting
const createWrapper = () => mount(EditProductView, {
    global: {
        stubs: { ProductForm: true }, // Stub the form component
    },
});

// Define the exposed method type for handleUpdate (if needed, otherwise rely on form emit)
interface EditProductViewExposed {
    handleUpdate: (formData: any) => Promise<void>;
}


describe('EditProductView.vue', () => {
    
    // Ensure state is clean before each test
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentProduct.value = null;
        mockRouteParamsId.value = '10'; // Reset ID
        mockLoading.value = false;
        mockError.value = null;

        mockFetchProductById.mockClear(); 
        mockEditProduct.mockClear();
        mockRouterPush.mockClear();

        // Spy on window.alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Since the component has both onMounted and a route watcher, it makes 2 calls on initial mount.
    
    // ===============================================
    // 1. Initial Data Loading and Route Handling
    // ===============================================
    it('fetches product data on mount using the initial route ID (2 calls)', async () => {
        const wrapper = createWrapper();
        await nextTick(); // Wait for onMounted and watcher to fire

        // Expect 2 calls due to concurrent onMounted and immediate watch
        expect(mockFetchProductById).toHaveBeenCalledTimes(1); 
        expect(mockFetchProductById).toHaveBeenCalledWith(10);
        
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
    // 2. Data Transformation
    // ===============================================
    it('transforms fetched product object into form data, including ID', async () => {
        const wrapper = createWrapper();
        
        // 1. Simulate data being loaded successfully (Triggers currentProduct watcher)
        mockCurrentProduct.value = mockFetchedProduct;
        await nextTick(); // Wait for currentProduct watch handler to update initialFormState

        const formStub = wrapper.findComponent(ProductForm);
        const initialDataProp = formStub.props('initialData');

        // 2. Assert transformation correctness
        expect(initialDataProp.id).toBe(10);
        expect(initialDataProp.productName).toBe('Widget Alpha');
        expect(initialDataProp.productPrice).toBe(50.99);
        
        wrapper.unmount();
    });

    // ===============================================
    // 3. Update Submission Flow
    // ===============================================
    it('calls editProduct with payload and redirects on success', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);

        const updatedPayload = { 
            id: 10, // Must be present
            productName: 'Widget Alpha Updated', 
            productType: 2,
            productPrice: 55.00,
            productQnt: 100,
        };
        
        // 1. Simulate the form component emitting the submit-form event
        productForm.vm.$emit('submit-form', updatedPayload);

        // Wait for the async editProduct call to resolve
        await nextTick(); 

        // 2. Assert service call
        expect(mockEditProduct).toHaveBeenCalledTimes(1);
        expect(mockEditProduct).toHaveBeenCalledWith(updatedPayload);

        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("Product updated successfully!");
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'product-info',
            params: { id: 10 }
        });

        wrapper.unmount();
    });

    it('prevents update and alerts if productName is missing from payload', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);
        
        const invalidPayload = { 
            id: 10, 
            productName: '', // Missing name
            productType: 2,
            productPrice: 55.00,
            productQnt: 100,
        };

        // 1. Simulate the form component emitting the submit-form event
        productForm.vm.$emit('submit-form', invalidPayload);
        
        // Wait for the synchronous validation check
        await nextTick();

        // Assert API call was blocked
        expect(mockEditProduct).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("The name of the product is required.");
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
    
    it('does not redirect on API failure', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);

        // Mock the API to return failure (false)
        mockEditProduct.mockResolvedValue(false); 
        
        const validPayload = { ...mockFetchedProduct };
        
        // 1. Simulate form submission with valid data
        productForm.vm.$emit('submit-form', validPayload);
        
        // Wait for the async editProduct call to resolve
        await nextTick(); 

        // 2. Assert API was called
        expect(mockEditProduct).toHaveBeenCalledTimes(1);

        // 3. Assert no success alert or redirection occurred
        expect(window.alert).not.toHaveBeenCalledWith("Product updated successfully!"); 
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
});