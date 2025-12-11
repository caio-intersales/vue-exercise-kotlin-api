import { describe, it, expect, vi, beforeEach, type Mock, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import DeleteUserView from '../DeleteUserView.vue';

// --- MOCK DATA ---
const mockUser = {
    id: 10,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@test.com',
    deliveryAddress: '789 Pine Ln',
};

// --- MOCK DEPENDENCIES STATE ---
const mockCurrentUser: Ref<typeof mockUser | null> = ref(null);
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
const mockFetchUserById = vi.fn((id: number) => {
    // Immediately set data for the test run
    mockCurrentUser.value = id === 10 ? mockUser : null;
});
const mockDeleteUser = vi.fn(() => Promise.resolve(true)); // Default: Success

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useUsers', () => ({
    useUsers: () => ({
        currentUser: mockCurrentUser,
        loading: mockLoading,
        error: mockError,
        fetchUserById: mockFetchUserById,
        deleteUser: mockDeleteUser,
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
const createWrapper = () => mount(DeleteUserView, {
    global: {
        // No stubs needed since there are no child components
    },
});

describe('DeleteUserView.vue', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCurrentUser.value   = null;
        mockRouteParamsId.value = '10';
        mockLoading.value   = false;
        mockError.value     = null;

        // Mock window functions (alert/confirm)
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        // Default confirm to TRUE (user clicks OK)
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        mockFetchUserById.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===============================================
    // 1. Initial Data Loading & Display States
    // ===============================================
    it('fetches user data on mount and displays deletion confirmation', async () => {
        const wrapper = createWrapper();
        await nextTick();
        
        // 1. Assert fetch was called once
        expect(mockFetchUserById).toHaveBeenCalledTimes(1);
        expect(mockFetchUserById).toHaveBeenCalledWith(10);
        
        // 2. Simulate data load (since mockFetchUserById sets the ref immediately)
        mockCurrentUser.value = mockUser;
        await nextTick();

        // 3. Assert user data is displayed
        const header = wrapper.find('h2').text();
        expect(header).toContain('Alice Smith');
        expect(header).toContain('ID # 10');
        expect(wrapper.find('.delete-button').exists()).toBe(true);
        
        wrapper.unmount();
    });

    it('displays loading state while data is being fetched', async () => {
        mockLoading.value = true;
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('Loading user...');
        expect(wrapper.find('h2').exists()).toBe(false);

        wrapper.unmount();
    });

    it('displays error message if fetch fails', async () => {
        mockError.value = 'User not found.';
        const wrapper = createWrapper();
        await nextTick();
        
        expect(wrapper.text()).toContain('User could not be loaded.');
        expect(wrapper.find('h2').exists()).toBe(false);

        wrapper.unmount();
    });

    // ===============================================
    // 2. Deletion Flow
    // ===============================================
    it('successfully deletes user and redirects to all-users page', async () => {
        mockCurrentUser.value = mockUser;
        const wrapper = createWrapper();
        await nextTick();

        // Click the delete button
        await wrapper.find('.delete-button').trigger('click');
        
        // 1. Assert confirmation was shown
        expect(window.confirm).toHaveBeenCalledWith(
            "Do you want to permanently delete Alice Smith? This cannot be undone."
        );
        
        // 2. Assert API call happened (since confirm is mocked to return true)
        expect(mockDeleteUser).toHaveBeenCalledTimes(1);
        expect(mockDeleteUser).toHaveBeenCalledWith(10);
        
        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("The user was successfully deleted.");
        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'all-users' });

        wrapper.unmount();
    });

    it('cancels deletion when user clicks no/cancel', async () => {
        mockCurrentUser.value = mockUser;
        // Mock confirm to return FALSE (user clicks Cancel)
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const wrapper = createWrapper();
        await nextTick();

        // Click the delete button
        await wrapper.find('.delete-button').trigger('click');
        
        // Assert confirmation was shown
        expect(window.confirm).toHaveBeenCalledTimes(1);
        
        // Assert API call was skipped
        expect(mockDeleteUser).not.toHaveBeenCalled();
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    it('shows error alert if deleteUser API call fails', async () => {
        mockCurrentUser.value = mockUser;
        mockError.value = null;

        mockDeleteUser.mockImplementation(async (...args: any[]) => { // Use ...args to match any possible signature
            // Simulate API failure and set the error state like the real composable would
            mockError.value = 'Database constraint error.'; 
            return false;
        });
        
        const wrapper = createWrapper();
        await nextTick();
        await nextTick();

        // Assert button is now found before triggering
        expect(wrapper.find('.delete-button').exists()).toBe(true);

        // 1. Click the delete button and confirm
        await wrapper.find('.delete-button').trigger('click');
        
        // 2. Wait for the async deleteUser call and the error state to update
        await nextTick(); 
        
        // 3. Assert API call happened
        expect(mockDeleteUser).toHaveBeenCalledTimes(1);
        
        // 4. Assert failure alert was shown using the error message
        expect(window.alert).toHaveBeenCalledWith("Deletion: failed Database constraint error.");
        expect(mockRouterPush).not.toHaveBeenCalled();

        wrapper.unmount();
    });

    // ===============================================
    // 3. Navigation
    // ===============================================
    it('calls router.back() when cancel button is clicked', async () => {
        mockCurrentUser.value = mockUser;
        const wrapper = createWrapper();
        await nextTick();
        
        // Find and click the 'Cancel' button (it's the second button)
        await wrapper.findAll('button')[1]!.trigger('click');
        
        expect(mockRouterBack).toHaveBeenCalledTimes(1);
        
        wrapper.unmount();
    });
});