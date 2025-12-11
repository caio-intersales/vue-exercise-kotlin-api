import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick, type Ref, reactive } from 'vue';
import EditUserView from '../EditUserView.vue';
import UserForm from '@/components/UserForm.vue'; // Need to import for finding stub

// --- MOCK DATA ---
const mockFetchedUser = {
    id: 10,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@test.com',
    deliveryAddress: '789 Pine Ln',
};

// --- MOCK DEPENDENCIES STATE ---
const mockCurrentUser: Ref<typeof mockFetchedUser | null> = ref(null);
const mockLoading: Ref<boolean> = ref(false);
const mockError: Ref<string | null> = ref(null);

// --- MOCK DEPENDENCY FUNCTIONS ---
const mockFetchUserById = vi.fn((id: number) => {
    // Simulate API delay and state update
    mockLoading.value = true;
    setTimeout(() => {
        mockCurrentUser.value = id === 10 ? mockFetchedUser : null;
        mockLoading.value = false;
    }, 10);
});
const mockEditUser = vi.fn(() => Promise.resolve(true)); // Assume success by default

// --- MOCK COMPOSABLE ---
vi.mock('@/composables/useUsers', () => ({
    useUsers: () => ({
        currentUser: mockCurrentUser,
        fetchUserById: mockFetchUserById,
        editUser: mockEditUser,
        loading: mockLoading,
        error: mockError,
    }),
}));

// --- MOCK ROUTER/ROUTE ---
const mockRouteParamsId = ref('10'); // Start with a valid ID
const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockRouterPush }),
    useRoute: () => ({
        params: reactive({ id: mockRouteParamsId })
    }),
}));

// --- TEST SUITE ---
describe('EditUserView.vue', () => {
    
    // Define the component instance with the exposed method for submission testing
    // This assumes you added defineExpose({ handleUpdate }) to EditUserView.vue
    interface EditUserViewExposed {
        handleUpdate: (formData: any) => Promise<void>;
    }

    const createWrapper = () => mount(EditUserView, {
        global: {
            stubs: { UserForm: true },
        },
    });

    let wrapper: ReturnType<typeof mount> | undefined;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCurrentUser.value   = null;
        mockRouteParamsId.value = '10'; // Reset ID
        mockLoading.value       = false;
        mockError.value         = null;
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        mockFetchUserById.mockClear();

        wrapper = createWrapper();
        await nextTick(); // Wait for onMounted to fire (Call 1)
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    // Remount the component instance here so the before/after work correctly for each test
    // Need to use the component reference for finding, but VTU needs to be re-mounted.
    const getWrapper = () => mount(EditUserView, {
        global: {
            stubs: { UserForm: true },
        },
    });

    // ===============================================
    // 1. Initial Data Loading and Route Handling
    // ===============================================

    it('fetches user data on mount using the initial route ID', async () => {
        const mountedWrapper = createWrapper();
        await nextTick();

        mockFetchUserById.mockClear(); 

        // Assert nothing has been called yet
        expect(mockFetchUserById).toHaveBeenCalledTimes(0); 
        
        // 1. Clear history
        mockFetchUserById.mockClear();
        
        // 2. Mount component
        const freshWrapper = createWrapper();
        await nextTick();
        
        // 3. Assert onMounted ran once
        expect(mockFetchUserById).toHaveBeenCalledTimes(1);
        expect(mockFetchUserById).toHaveBeenCalledWith(10);
        freshWrapper.unmount(); // Clean up immediately after test
    });

    it('re-fetches user data when the route ID changes', async () => {
        // 1. Setup (Call 1 from onMounted, Call 2 from route watcher initial run)
        const mountedWrapper = createWrapper();
        await nextTick();
        
        // Assert the initial calls happened
        expect(mockFetchUserById).toHaveBeenCalledTimes(2);
        
        // Clear history to isolate the change effect
        mockFetchUserById.mockClear(); 
        
        // 2. Simulate route change (Triggers the route watcher)
        mockRouteParamsId.value = '20';
        await nextTick(); 
        
        // 3. Assert only the single change call occurred
        expect(mockFetchUserById).toHaveBeenCalledTimes(3); 
        expect(mockFetchUserById).toHaveBeenCalledWith(20);

        mountedWrapper.unmount(); // Clean up
    });
    
    // ===============================================
    // 2. Data Transformation (CRITICAL TEST)
    // ===============================================
    it('transforms fetched user object into form data, keeping password empty', async () => {
        const mountedWrapper = getWrapper();
        
        // 1. Simulate data being loaded successfully
        mockCurrentUser.value = mockFetchedUser;
        await nextTick(); // Wait for currentUser watch handler

        const formStub = mountedWrapper.findComponent(UserForm);
        const initialDataProp = formStub.props('initialData');

        // 2. Assert transformation correctness
        expect(initialDataProp.id).toBe(10);
        expect(initialDataProp.email).toBe('alice@test.com');
        
        // CRITICAL ASSERTION: rawPassword must be an empty string, NOT undefined or the previous value
        expect(initialDataProp.rawPassword).toBe(''); 
    });

    // ===============================================
    // 3. Update Submission Flow
    // ===============================================
    it('calls editUser with payload and redirects on success', async () => {
        const mountedWrapper = getWrapper();
        const exposedVm = mountedWrapper.vm as unknown as EditUserViewExposed;

        const updatedPayload = { 
            id: 10, // Must be present
            firstName: 'Alice Updated', 
            email: 'alice@update.com', 
            rawPassword: 'newpassword', // Assume form filled password
            deliveryAddress: '789 Pine Ln',
        };
        
        // 1. Call the exposed handleUpdate method
        await exposedVm.handleUpdate(updatedPayload);

        // 2. Assert service call
        expect(mockEditUser).toHaveBeenCalledTimes(1);
        expect(mockEditUser).toHaveBeenCalledWith(updatedPayload);

        // 3. Assert success alert and redirection
        expect(window.alert).toHaveBeenCalledWith("User updated successfully!");
        expect(mockRouterPush).toHaveBeenCalledWith({
            name: 'user-info',
            params: { id: 10 }
        });
    });

    it('prevents update and alerts if ID or required data is missing from payload', async () => {
        const mountedWrapper = getWrapper();
        const exposedVm = mountedWrapper.vm as unknown as EditUserViewExposed;
        
        const invalidPayload = { 
            firstName: 'Alice', 
            email: 'a@a.com', 
            id: undefined, // Missing ID
            deliveryAddress: '789 Pine Ln',
        };

        await exposedVm.handleUpdate(invalidPayload);

        // Assert API call was blocked
        expect(mockEditUser).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("user data or ID missing.");
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
});