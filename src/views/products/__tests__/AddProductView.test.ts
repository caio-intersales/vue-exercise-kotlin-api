import { describe, it, expect, vi, beforeEach, type Mock, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref } from 'vue';
import AddProductView from '../AddProductView.vue';
import ProductForm from '@/components/ProductForm.vue';
import type { BasicProductData } from '@/composables/useProducts';

// --- MOCK DATA ---
const mockProductData: BasicProductData = {
    productName: 'Laptop Pro',
    productType: 1,
    productPrice: 1200,
    productQnt: 10
};

const mockCreatedProduct = {
    ...mockProductData,
    id: 99, // Simulate the ID assigned by the backend
};

// --- MOCK DEPENDENCIES STATE ---
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
// Default: Assume successful creation
const mockCreateProduct = vi.fn((data: BasicProductData) => Promise.resolve(mockCreatedProduct)); 

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useProducts', () => ({
    useProducts: () => ({
        createProduct: mockCreateProduct,
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
// Factory function for mounting with shallow mount (only renders AddProductView, stubs children)
const createWrapper = () => mount(AddProductView, {
    global: {
        // Shallow mount stubs the ProductForm component
        stubs: { ProductForm: true }, 
    },
});

describe('AddProductView.vue', () => {

    // Ensure state is clean before each test
    beforeEach(() => {
        vi.clearAllMocks();
        mockLoading.value = false;
        mockError.value = null;
        mockCreateProduct.mockClear();
        mockRouterPush.mockClear();

        // Spy on window.alert to prevent blocking the test runner
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Rendering
    // ===============================================
    it('renders the ProductForm component with correct initial props', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);

        expect(productForm.exists()).toBe(true);
        expect(productForm.props('mode')).toBe('create');
        expect(productForm.props('submitText')).toBe('Add new product');

        // Check the structure of initial data
        const initialData = productForm.props('initialData');
        expect(initialData).toEqual({
            productName: '',
            productType: 0,
            productPrice: 0,
            productQnt: 0
        });

        wrapper.unmount();
    });

    // ===============================================
    // 2. Successful Submission Flow
    // ===============================================
    it('handles successful form submission, alerts, and redirects', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);
        
        // 1. Simulate the form component emitting the submit-form event
        productForm.vm.$emit('submit-form', mockProductData);
        
        // Wait for the async createProduct call to resolve
        await nextTick(); 

        // 2. Assert API was called correctly
        expect(mockCreateProduct).toHaveBeenCalledTimes(1);
        expect(mockCreateProduct).toHaveBeenCalledWith(mockProductData);

        // 3. Assert success alert was shown
        expect(window.alert).toHaveBeenCalledWith(
            "Product added successfully! You'll be redirected to the product's page."
        );

        // 4. Assert redirection to the new product's info page
        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'product-info',
            params: { id: mockCreatedProduct.id }
        });

        wrapper.unmount();
    });

    // ===============================================
    // 3. Client-Side Validation
    // ===============================================
    it('prevents submission and alerts if productName is missing', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);
        
        // Simulate payload with missing name
        const invalidData: BasicProductData = {
            productName: '', // Missing name
            productType: 1,
            productPrice: 10,
            productQnt: 1
        };
        
        // 1. Simulate the form component emitting the submit-form event
        productForm.vm.$emit('submit-form', invalidData);
        
        // Wait for the synchronous validation check
        await nextTick(); 

        // 2. Assert API was NOT called
        expect(mockCreateProduct).not.toHaveBeenCalled();

        // 3. Assert client-side validation alert was shown
        expect(window.alert).toHaveBeenCalledWith("Give at least the name of the product.");
        
        // 4. Assert no redirection occurred
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
    
    // ===============================================
    // 4. API Failure Handling
    // ===============================================
    it('does not redirect on API failure', async () => {
        const wrapper = createWrapper();
        const productForm = wrapper.findComponent(ProductForm);

        // Mock the API to return failure (null/undefined)
        mockCreateProduct.mockResolvedValue(undefined as any); 
        
        // 1. Simulate form submission with valid data
        productForm.vm.$emit('submit-form', mockProductData);
        
        // Wait for the async createProduct call to resolve
        await nextTick(); 

        // 2. Assert API was called
        expect(mockCreateProduct).toHaveBeenCalledTimes(1);

        // 3. Assert no success alert or redirection occurred
        expect(window.alert).not.toHaveBeenCalled(); 
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });
});