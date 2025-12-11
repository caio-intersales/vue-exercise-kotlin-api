// UserForm.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserForm from '../UserForm.vue';
import type { BasicUserData } from '@/composables/useUsers';

// Define the full form data interface for testing
interface UserFormData extends BasicUserData {
    id?: number;
    rawPassword?: string; 
}

// --- MOCK DATA ---
const mockInitialData: UserFormData = {
    firstName: '',
    lastName: '',
    email: '',
    deliveryAddress: '',
    rawPassword: '',
};

const fullUserPayload: UserFormData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    deliveryAddress: '123 Main St',
    rawPassword: 'securepassword123',
};

// --- TEST SUITE ---
describe('UserForm.vue', () => {
    // Default props setup for create mode
    const defaultProps = {
        mode: 'create' as const,
        initialData: mockInitialData,
        loading: false,
        error: null,
        submitText: 'Create User',
    };

    // ===============================================
    // 1. Conditional Rendering Tests
    // ===============================================
    describe('Conditional Rendering', () => {
        it('renders Password field in "create" mode', () => {
            const wrapper = mount(UserForm, { props: defaultProps });
            expect(wrapper.find('#password').exists()).toBe(true);
            expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
        });

        it('hides Password field and shows ID field in "edit" mode', () => {
            const wrapper = mount(UserForm, { 
                props: { 
                    ...defaultProps, 
                    mode: 'edit',
                    initialData: { id: 1, ...fullUserPayload }
                } 
            });
            
            // Password field should be hidden
            expect(wrapper.find('#password').exists()).toBe(false);

            // Hidden ID field should be present
            const idInput = wrapper.find('input[type="hidden"]');
            expect(idInput.exists()).toBe(true);
            
            // Assert the ID value binding
            expect((idInput.element as HTMLInputElement).value).toBe('1');
        });
    });

    // ===============================================
    // 2. Data Synchronization and Prop Watching
    // ===============================================
    describe('Data Synchronization', () => {
        it('pre-populates the form with initialData in edit mode', () => {
             const editInitialData: UserFormData = {
                id: 99,
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@test.com',
                deliveryAddress: '456 Oak Ln',
            };

            const wrapper = mount(UserForm, {
                props: {
                    ...defaultProps,
                    mode: 'edit',
                    initialData: editInitialData,
                }
            });

            // Assert that form fields are populated
            expect((wrapper.find('#firstName').element as HTMLInputElement).value).toBe('Jane');
            expect((wrapper.find('#email').element as HTMLInputElement).value).toBe('jane@test.com');
        });

        it('updates formState when initialData prop changes (watch hook)', async () => {
            const wrapper = mount(UserForm, { props: defaultProps });
            
            // Sanity check
            expect((wrapper.find('#firstName').element as HTMLInputElement).value).toBe('');
            
            // Simulate prop update
            const newData: UserFormData = {
                firstName: 'Updated', 
                lastName: 'User',
                email: 'new@email.com',
                deliveryAddress: 'New Address',
            };
            await wrapper.setProps({ initialData: newData });

            // Check if formState updated
            expect((wrapper.find('#firstName').element as HTMLInputElement).value).toBe('Updated');
        });
    });
    
    // ===============================================
    // 3. Submission and Cleanup Logic Tests (CRITICAL)
    // ===============================================
    describe('Form Submission and Payload Cleanup', () => {
        it('emits a payload with password in create mode', async () => {
            const wrapper = mount(UserForm, { props: defaultProps });

            // Fill all fields including password
            await wrapper.find('#firstName').setValue(fullUserPayload.firstName);
            await wrapper.find('#lastName').setValue(fullUserPayload.lastName);
            await wrapper.find('#email').setValue(fullUserPayload.email);
            await wrapper.find('#password').setValue(fullUserPayload.rawPassword);
            
            // Submit
            await wrapper.find('form').trigger('submit.prevent');

            const emittedPayload = wrapper.emitted('submitForm')![0]![0] as UserFormData;

            // ASSERTION: rawPassword MUST be present in create mode
            expect(emittedPayload).toEqual(expect.objectContaining({
                firstName: fullUserPayload.firstName,
                rawPassword: fullUserPayload.rawPassword,
            }));
            expect(emittedPayload.id).toBeUndefined();
        });

        it('emits a payload WITHOUT password when in edit mode and password field is EMPTY', async () => {
            const editProps = {
                ...defaultProps,
                mode: 'edit' as const,
                initialData: { 
                    id: 1, 
                    ...fullUserPayload, 
                    rawPassword: '' // Ensure initial state is empty string for rawPassword
                },
                submitText: 'Save Changes'
            };
            const wrapper = mount(UserForm, { props: editProps });
            
            // The password field is hidden, so its value remains the empty string
            
            // Submit
            await wrapper.find('form').trigger('submit.prevent');

            const emittedPayload = wrapper.emitted('submitForm')![0]![0] as UserFormData;

            // ASSERTION: The cleanup logic MUST remove the empty rawPassword property
            expect(emittedPayload.id).toBe(1);
            expect(emittedPayload.rawPassword).toBeUndefined(); 
            
            // Sanity check other properties remain
            expect(emittedPayload.email).toBe(fullUserPayload.email);
        });

        it('emits a payload WITH password when in edit mode and password field is FILLED', async () => {
            const editProps = {
                ...defaultProps,
                mode: 'edit' as const,
                initialData: { 
                    id: 1, 
                    ...fullUserPayload, 
                    rawPassword: 'new-secure-password' 
                },
                submitText: 'Save Changes'
            };
            
            const wrapper = mount(UserForm, { props: editProps });
            
            // Submit the form which contains the non-empty rawPassword in formState
            await wrapper.find('form').trigger('submit.prevent');

            const emittedPayload = wrapper.emitted('submitForm')![0]![0] as UserFormData;

            // ASSERTION: The cleanup logic should NOT delete the rawPassword property
            expect(emittedPayload.id).toBe(1);
            expect(emittedPayload.rawPassword).toBe('new-secure-password'); 
        });
    });

    // ===============================================
    // 4. State Display Tests
    // ===============================================
    // (Tests for loading and error props are identical to ProductForm, included for completeness)
    describe('State Display', () => {
        it('disables the submit button and changes text when loading is true', async () => {
            const wrapper = mount(UserForm, { props: defaultProps });

            await wrapper.setProps({ loading: true });

            const button = wrapper.find('button[type="submit"]');
            expect(button.attributes('disabled')).toBe('');
            expect(button.text()).toBe('Processing...');
        });

        it('displays error message when error prop is set', async () => {
            const wrapper = mount(UserForm, { props: defaultProps });

            await wrapper.setProps({ error: 'Email already exists.' });
            
            const errorMessage = wrapper.find('.error-message');
            expect(errorMessage.exists()).toBe(true);
            expect(errorMessage.text()).toContain('Email already exists.');
        });
    });
});