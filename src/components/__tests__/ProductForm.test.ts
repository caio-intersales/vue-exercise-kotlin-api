import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProductForm from '../ProductForm.vue';
import type { BasicProductData } from '@/composables/useProducts';

// Extend BasicProductData to include the optional ID for edit mode
interface ProductFormData extends BasicProductData {
    id?: number;
}

// --- MOCK DATA ---
const mockInitialData: ProductFormData = {
    productName: '',
    productType: 1,
    productPrice: 0,
    productQnt: 0,
};

// --- TEST SUITE ---
describe('ProductForm.vue', () => {
    // Default props for create mode
    const defaultProps = {
        mode: 'create' as const,
        initialData: mockInitialData,
        loading: false,
        error: null,
        submitText: 'Add Product',
    };

    // ===============================================
    // 1. Initialization and Rendering Tests
    // ===============================================
    describe('Initialization and Rendering', () => {
        it('renders the correct submit button text', () => {
            const wrapper = mount(ProductForm, { props: defaultProps });
            expect(wrapper.find('button[type="submit"]').text()).toBe('Add Product');
        });

        it('does NOT render the hidden ID field in "create" mode', () => {
            const wrapper = mount(ProductForm, { props: defaultProps });
            expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
        });

        it('renders the hidden ID field in "edit" mode and pre-populates the fields', () => {
            const editInitialData: ProductFormData = {
                id: 50,
                productName: 'Monitor 4K',
                productType: 3,
                productPrice: 499.99,
                productQnt: 15,
            };

            const wrapper = mount(ProductForm, { 
                props: { 
                    ...defaultProps, 
                    mode: 'edit',
                    initialData: editInitialData
                }
            });

            // Check hidden ID field
            const idInput = wrapper.find('input[type="hidden"]');
            expect(idInput.exists()).toBe(true);
            expect((idInput.element as HTMLInputElement).value).toBe('50');

            // Check other inputs are pre-populated
            expect((wrapper.find('#productName').element as HTMLInputElement).value).toBe('Monitor 4K');
            expect((wrapper.find('#productPrice').element as HTMLInputElement).value).toBe('499.99');
        });
    });

    // ===============================================
    // 2. Data Synchronization and Prop Watching
    // ===============================================
    describe('Data Synchronization', () => {
        it('updates formState when initialData prop changes (watch hook)', async () => {
            const wrapper = mount(ProductForm, { props: defaultProps });
            
            // Check initial state
            expect((wrapper.find('#productName').element as HTMLInputElement).value).toBe('');
            
            // Simulate prop update (e.g., parent view fetches new data)
            const newData: ProductFormData = {
                productName: 'Updated Widget', 
                productType: 5,
                productPrice: 12.50,
                productQnt: 100,
            };
            await wrapper.setProps({ initialData: newData });

            // Check if formState updated
            expect((wrapper.find('#productName').element as HTMLInputElement).value).toBe('Updated Widget');
            expect((wrapper.find('#productQnt').element as HTMLInputElement).value).toBe('100');
        });
    });

    // ===============================================
    // 3. User Input and Submission Tests
    // ===============================================
    describe('Form Submission', () => {
        const fullPayload: ProductFormData = {
            productName: 'Keyboard Mechanical',
            productType: 2,
            productPrice: 150.75,
            productQnt: 20,
        };

        it('emits submitForm event with the correct payload structure (create mode)', async () => {
            const wrapper = mount(ProductForm, { props: defaultProps });

            // 1. Simulate user filling the form
            await wrapper.find('#productName').setValue(fullPayload.productName);
            // NOTE: setValue on number inputs binds the value as a string, but the browser
            // attempts to coerce it. We assert the final emitted payload type below.
            await wrapper.find('#productType').setValue(fullPayload.productType); 
            await wrapper.find('#productPrice').setValue(fullPayload.productPrice);
            await wrapper.find('#productQnt').setValue(fullPayload.productQnt);

            // 2. Submit the form
            await wrapper.find('form').trigger('submit.prevent');

            // 3. Assert the event was emitted
            const emitted = wrapper.emitted('submitForm');
            expect(emitted).toHaveLength(1);

            // 4. Assert the payload structure and type correctness
            const emittedPayload = emitted![0]![0] as ProductFormData;
            
            // Should contain the basic fields but NOT an ID in create mode
            expect(emittedPayload).toEqual(fullPayload);
            expect(emittedPayload.id).toBeUndefined();
            
            // CRITICAL CHECK: Ensure number inputs are emitted as actual JavaScript numbers, not strings
            expect(typeof emittedPayload.productType).toBe('number');
            expect(typeof emittedPayload.productPrice).toBe('number');
            expect(typeof emittedPayload.productQnt).toBe('number');
        });
        
        it('emits submitForm event with ID included (edit mode)', async () => {
            const editProps = {
                ...defaultProps,
                mode: 'edit' as const,
                initialData: { id: 12, ...fullPayload },
                submitText: 'Save Changes'
            };
            const wrapper = mount(ProductForm, { props: editProps });
            
            // Sanity check: form is pre-filled, so we just submit
            await wrapper.find('form').trigger('submit.prevent');

            const emittedPayload = wrapper.emitted('submitForm')![0]![0] as ProductFormData;

            // Assert that the hidden ID is correctly included in the payload
            expect(emittedPayload.id).toBe(12);
        });
    });

    // ===============================================
    // 4. State Display Tests
    // ===============================================
    describe('State Display', () => {
        it('disables the submit button and changes text when loading is true', async () => {
            const wrapper = mount(ProductForm, { props: defaultProps });

            await wrapper.setProps({ loading: true });

            const button = wrapper.find('button[type="submit"]');
            expect(button.attributes('disabled')).toBe('');
            expect(button.text()).toBe('Processing...');
        });

        it('displays error message when error prop is set', async () => {
            const wrapper = mount(ProductForm, { props: defaultProps });

            await wrapper.setProps({ error: 'Product name must be unique.' });
            
            const errorMessage = wrapper.find('.error-message');
            expect(errorMessage.exists()).toBe(true);
            expect(errorMessage.text()).toContain('Product name must be unique.');
        });
    });
});