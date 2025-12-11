import { describe, it, expect, vi, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, type Ref } from 'vue';
import OrderForm from '../OrderForm.vue';
import type { BasicOrderData } from '@/composables/useOrders';

// --- MOCK DATA ---
const mockUsers = [
    { id: 1, firstName: 'A', lastName: 'User', email: 'a@test.com', deliveryAddress: '1 St' },
    { id: 2, firstName: 'B', lastName: 'User', email: 'b@test.com', deliveryAddress: '2 St' },
];
const mockProducts = [
    { id: 101, productName: 'Laptop', productType: 1, productPrice: 1200, productQnt: 5 },
    { id: 102, productName: 'Mouse', productType: 2, productPrice: 25, productQnt: 50 },
    { id: 103, productName: 'Monitor', productType: 1, productPrice: 300, productQnt: 10 },
];
const mockInitialData: BasicOrderData = {
    orderOwner: null,
    orderProducts: [],
};

// --- COMPOSABLE MOCKS ---
// Mock the useUsers composable

const mockFetchUsers    = vi.fn();
const mockFetchProducts = vi.fn();

vi.mock('@/composables/useUsers', () => ({
    useUsers: () => ({
        allUsers: ref(mockUsers), // Return mock data immediately
        fetchAllUsers: mockFetchUsers,   // Mock the function
    }),
}));

// Mock the useProducts composable
vi.mock('@/composables/useProducts', () => ({
    useProducts: () => ({
        allProducts: ref(mockProducts), // Return mock data immediately
        fetchAllProducts: mockFetchProducts,      // Mock the function
    }),
}));

interface MockedComposables {
    useUsers: () => {
        allUsers: Ref<any[]>;
        fetchAllUsers: Mock;
    };
    useProducts: () => {
        allProducts: Ref<any[]>;
        fetchAllProducts: Mock;
    }
}

describe('OrderForm.vue', () => {
    // Basic props setup for create mode
    const defaultProps = {
        mode: 'create' as const,
        initialData: mockInitialData,
        loading: false,
        error: null,
        submitText: 'Create Order',
    };

    // ===============================================
    // 1. Lifecycle and Rendering Tests
    // ===============================================
    describe('Initialization and Rendering', () => {
        it('renders the form elements correctly', () => {
            const wrapper = mount(OrderForm, { props: defaultProps });
            
            // Check if the submit button text is correct
            expect(wrapper.find('button[type="submit"]').text()).toBe('Create Order');

            // Check if the user select dropdown is present and populated
            const issuerOptions = wrapper.findAll('#orderIssuerSelect option');
            // Expect 1 placeholder option + 2 mock users
            expect(issuerOptions.length).toBe(3); 
            expect(issuerOptions[1]!.text()).toContain('A User');

            // Check if the product checkboxes are present and populated
            const productCheckboxes = wrapper.findAll('input[type="checkbox"]');
            expect(productCheckboxes.length).toBe(3); 
            expect(wrapper.html()).toContain('Monitor');
        });

        it('calls fetchAllUsers and fetchAllProducts on mount', () => {
            // Clear the call history before mounting to ensure only this test's calls are counted
            mockFetchUsers.mockClear(); 
            mockFetchProducts.mockClear(); 
            
            mount(OrderForm, { props: defaultProps });

            // Assert against the globally defined mock functions
            expect(mockFetchUsers).toHaveBeenCalledTimes(1);
            expect(mockFetchProducts).toHaveBeenCalledTimes(1);
        });

        it('does NOT render the hidden ID field in "create" mode', () => {
            const wrapper = mount(OrderForm, { props: defaultProps });
            expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
        });

        it('renders the hidden ID field in "edit" mode', () => {
            const wrapper = mount(OrderForm, { 
                props: { ...defaultProps, mode: 'edit' }
            });
            expect(wrapper.find('input[type="hidden"]').exists()).toBe(true);
        });
    });

    // ===============================================
    // 2. Data Binding and Pre-population Tests
    // ===============================================
    describe('Data Synchronization', () => {
        it('pre-populates the form with initialData in edit mode', async () => {
            const editInitialData: BasicOrderData = {
                id: 50,
                orderOwner: 2, // User ID 2
                orderProducts: [101, 103], // Product IDs 101 and 103
            };

            const wrapper = mount(OrderForm, {
                props: {
                    ...defaultProps,
                    mode: 'edit',
                    initialData: editInitialData,
                }
            });

            // 1. Check Select binding
            const select = wrapper.find('#orderIssuerSelect');
            expect((select.element as HTMLSelectElement).value).toBe('2'); // IDs are strings in HTML value

            // 2. Check Checkbox binding
            const checkbox101 = wrapper.find('input[id="product-id-101"]');
            const checkbox102 = wrapper.find('input[id="product-id-102"]');
            const checkbox103 = wrapper.find('input[id="product-id-103"]');

            expect((checkbox101.element as HTMLInputElement).checked).toBe(true);
            expect((checkbox102.element as HTMLInputElement).checked).toBe(false);
            expect((checkbox103.element as HTMLInputElement).checked).toBe(true);
        });

        it('updates formState when initialData prop changes (due to watch)', async () => {
            const wrapper = mount(OrderForm, { props: defaultProps });
            
            const select = wrapper.find('#orderIssuerSelect');
            
            // Simulate prop update (e.g., from EditView loading data)
            const newData: BasicOrderData = {
                orderOwner: 1, 
                orderProducts: [102],
            };
            await wrapper.setProps({ initialData: newData });

            // Check if formState updated based on the watch() logic
            expect((select.element as HTMLSelectElement).value).toBe('1');
        });
    });

    // ===============================================
    // 3. Submission and Event Emission Tests
    // ===============================================
    describe('Form Submission', () => {
        it('emits a submitForm event with the current form state payload', async () => {
            const wrapper = mount(OrderForm, { props: defaultProps });

            // 1. Simulate user interaction to fill the form
            // Select user ID 2
            await wrapper.find('#orderIssuerSelect').setValue(2);
            // Select product ID 101 and 103
            await wrapper.find('input[id="product-id-101"]').setValue(true);
            await wrapper.find('input[id="product-id-103"]').setValue(true);

            // 2. Submit the form
            await wrapper.find('form').trigger('submit.prevent');

            // 3. Assert the event was emitted with the correct payload
            const emitted = wrapper.emitted('submitForm');
            expect(emitted).toHaveLength(1);

            const expectedPayload: BasicOrderData = {
                orderOwner: 2,
                orderProducts: [101, 103],
            };
            // Note: The hidden ID field is not in the formState because mode is 'create'
            expect(emitted![0]![0]).toEqual(expectedPayload);
        });

        it('disables the submit button when loading is true', async () => {
            const wrapper = mount(OrderForm, { props: defaultProps });

            // Initially not disabled
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();

            // Set loading to true
            await wrapper.setProps({ loading: true });

            // Check if disabled attribute exists and submit button text changed
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBe('');
            expect(wrapper.find('button[type="submit"]').text()).toBe('Processing...');
        });

        it('displays error message when error prop is set', async () => {
            const wrapper = mount(OrderForm, { props: defaultProps });
            expect(wrapper.find('.error-message').exists()).toBe(false);

            await wrapper.setProps({ error: 'Order failed to save.' });
            
            const errorMessage = wrapper.find('.error-message');
            expect(errorMessage.exists()).toBe(true);
            expect(errorMessage.text()).toContain('Order failed to save.');
        });
    });
});