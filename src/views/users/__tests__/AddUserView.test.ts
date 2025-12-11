import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, type Ref } from 'vue';
import AddUserView from '../AddUserView.vue';
import UserForm from '@/components/UserForm.vue'

// --- MOCK DEPENDENCIES ---

// 1. Mock the useUsers composable
const mockCreateUser = vi.fn((payload) => Promise.resolve({ id: 99, ...payload }));
const mockLoading   = ref(false);
const mockError: Ref<string | null> = ref(null);

vi.mock('@/composables/useUsers', () => ({
    useUsers: () => ({
        createUser: mockCreateUser,
        loading: mockLoading,
        error: mockError,
    }),
}));

// 2. Mock the vue-router's useRouter and useRoute
const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

// --- TEST SUITE ---
describe('AddUserView.vue', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        mockLoading.value = false;
        mockError.value = null;
        // Mock window.alert for validation test
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    // Only a partial mount is needed since the UserForm component is fully tested separately.
    // UserForm is mocked to isolate the view's logic.
    const wrapper = mount(AddUserView, {
        global: {
            stubs: {
                UserForm: {
                    template: '<div><slot/></div>', // Simple mock template
                    props: ['initialData', 'loading', 'error', 'submitText'],
                    emits: ['submitForm'],
                },
            },
        },
    });

    // ===============================================
    // 1. Core Logic & Service Integration
    // ===============================================
    it('calls createUser and handles successful redirection on submit', async () => {
        const mockFormData = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@smith.com',
            rawPassword: 'password',
            deliveryAddress: '1 Test Lane',
        };

        // Simulate the UserForm successfully emitting the clean data
        await wrapper.vm.handleSubmit(mockFormData);

        // 1. Assert service call
        expect(mockCreateUser).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledWith(mockFormData);
        
        // 2. Assert success alert
        expect(window.alert).toHaveBeenCalledWith(
            "User added successfully! You'll be redirected to the user's page."
        );

        // 3. Assert redirection with the new ID (mockCreateUser returns { id: 99, ... })
        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'user-info',
            params: { id: 99 },
        });
    });
    
    // ===============================================
    // 2. Error and Loading State
    // ===============================================
    it('displays error message from composable', async () => {
        mockError.value = 'Email already taken by another user.';
        await wrapper.vm.$nextTick(); // Wait for state update

        // The error prop is passed to the UserForm stub, but we assert the stub receives it.
        // Since we stubbed UserForm, we check the prop passed to the stub.
        expect(wrapper.findComponent(UserForm).props('error')).toBe('Email already taken by another user.');
        
        // When error is present, router push should NOT be called
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
    
    it('shows "Processing..." text when loading is true', async () => {
        mockLoading.value = true;
        await wrapper.vm.$nextTick();
        
        // Check that the loading prop is correctly passed to the form component
        expect(wrapper.findComponent(UserForm).props('loading')).toBe(true);
    });

    // ===============================================
    // 3. Client-Side Validation
    // ===============================================
    it('prevents API call and shows alert if firstName is missing', async () => {
        const invalidData = {
            firstName: '', // Missing
            lastName: 'Test',
            email: 'valid@email.com',
            rawPassword: 'p',
            deliveryAddress: '123 Main St',
        };

        await wrapper.vm.handleSubmit(invalidData);

        // Assert API call was blocked
        expect(mockCreateUser).not.toHaveBeenCalled();
        
        // Assert validation alert was shown
        expect(window.alert).toHaveBeenCalledWith("First Name and Email are required.");
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
    
    it('prevents API call and shows alert if email is missing', async () => {
        const invalidData = {
            firstName: 'Valid',
            lastName: 'Test',
            email: '', // Missing
            rawPassword: 'p',
            deliveryAddress: '123 Main St',
        };

        await wrapper.vm.handleSubmit(invalidData);

        // Assert API call was blocked
        expect(mockCreateUser).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("First Name and Email are required.");
    });
});