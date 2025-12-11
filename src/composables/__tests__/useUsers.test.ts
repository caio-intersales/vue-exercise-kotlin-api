import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUsers, type User, type NewUser } from '../useUsers';
import { nextTick } from 'vue';

// --- MOCK SETUP ---
// Define a mock implementation for the global fetch function
const mockFetch = vi.fn();

// Replace the global fetch with mock function
vi.stubGlobal('fetch', mockFetch);

// Helper function to create a mock Response object
const createMockResponse = (data: any, status: number, ok: boolean = true) => ({
  json: () => new Promise((resolve) => resolve(data)),
  text: () => new Promise((resolve) => resolve(JSON.stringify(data))),
  ok,
  status,
});

// Define some mock data for reuse
const mockUsers: User[] = [
    { id: 1, firstName: 'A', lastName: 'A', email: 'a@test.com', deliveryAddress: '1 St' },
    { id: 2, firstName: 'B', lastName: 'B', email: 'b@test.com', deliveryAddress: '2 St' },
];

const mockNewUser: NewUser = { 
    firstName: 'C', lastName: 'C', email: 'c@test.com', deliveryAddress: '3 St', rawPassword: 'password' 
};
const mockCreatedUser: User = { id: 3, ...mockNewUser };

// --- END MOCK SETUP ---

describe('useUsers Composable', () => {
  let store: ReturnType<typeof useUsers>;

  beforeEach(() => {
    // 1. Reset the mock before each test to ensure isolation
    mockFetch.mockClear();

    // 2. Instantiate the composable before each test
    store = useUsers();
  });

  // ===============================================
  // 1. Test fetchAllUsers
  // ===============================================
  describe('fetchAllUsers', () => {
    it('should successfully fetch and populate allUsers state', async () => {
      // Setup the mock response for success
      mockFetch.mockResolvedValue(createMockResponse(mockUsers, 200));

      // 1. Assert initial state
      expect(store.loading.value).toBe(false);
      expect(store.allUsers.value).toEqual([]);

      // 2. Call the function
      const promise = store.fetchAllUsers();
      expect(store.loading.value).toBe(true); // Assert loading starts

      await promise;
      await nextTick();

      // 3. Assert final state
      expect(store.allUsers.value).toEqual(mockUsers);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/users/list'));
    });

    it('should handle API fetch failure and set error state', async () => {
      // Setup the mock response for failure (e.g., 500 status)
      mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

      await store.fetchAllUsers();
      await nextTick();

      // Assert error state
      expect(store.allUsers.value).toEqual([]);
      expect(store.error.value).toContain('HTTP error! Status: 500');
      expect(store.loading.value).toBe(false);
    });
  });

  // ===============================================
  // 2. Test fetchUserById
  // ===============================================
  describe('fetchUserById', () => {
    it('should successfully fetch and populate currentUser state', async () => {
      const userId = 1;
      const user = mockUsers[0];
      mockFetch.mockResolvedValue(createMockResponse(user, 200));

      await store.fetchUserById(userId);

      expect(store.currentUser.value).toEqual(user);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/users/show/${userId}`));
    });
    
    it('should handle "User not found" failure (404) and set error state', async () => {
      const userId = 99;
      mockFetch.mockResolvedValue(createMockResponse({}, 404, false));

      await store.fetchUserById(userId);

      expect(store.currentUser.value).toBeNull();
      expect(store.error.value).toContain('User not found or API error (404)');
      expect(store.loading.value).toBe(false);
    });
  });


  // ===============================================
  // 3. Test createUser
  // ===============================================
  describe('createUser', () => {
    it('should successfully create a user and return the created object', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockCreatedUser, 201));

      const result = await store.createUser(mockNewUser);

      expect(result).toEqual(mockCreatedUser);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/add'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockNewUser),
        })
      );
    });

    it('should handle creation failure and return null', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, 400, false));

      const result = await store.createUser(mockNewUser);

      expect(result).toBeNull();
      expect(store.error.value).toContain('Failed to create a new user. Status: 400');
    });
  });


  // ===============================================
  // 4. Test editUser
  // ===============================================
  describe('editUser', () => {
    it('should successfully update a user and return the updated object', async () => {

        const baseUser = mockUsers[0]! as User; // To prevent TS from throwing an error because of possible type errors with ID

        const updatedUser: User = { ...baseUser, firstName: 'Updated' };
        mockFetch.mockResolvedValue(createMockResponse(updatedUser, 200));

        const result = await store.editUser(updatedUser);

        expect(result).toEqual(updatedUser);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/edit'),
        expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updatedUser),
        })
        );
    });

    it('should handle update failure and return null', async () => {
        const baseUser = mockUsers[0]! as User; // To prevent TS from throwing an error because of possible type errors with ID

        const userToUpdate: User = { ...baseUser, firstName: 'Failed' };
        mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

        const result = await store.editUser(userToUpdate);

        expect(result).toBeNull();
        expect(store.error.value).toContain('Failed to update the user. Status: 500');
    });
  });

  // ===============================================
  // 5. Test deleteUser
  // ===============================================
  describe('deleteUser', () => {
    it('should successfully delete a user and return true', async () => {
      const userId = 1;
      // Mock 204 No Content for a successful deletion
      mockFetch.mockResolvedValue(createMockResponse(null, 204));

      const result = await store.deleteUser(userId);

      expect(result).toBe(true);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/users/delete/${userId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle deletion failure and return null', async () => {
      const userId = 99;
      mockFetch.mockResolvedValue(createMockResponse(null, 403, false));

      const result = await store.deleteUser(userId);

      expect(result).toBeNull();
      expect(store.error.value).toContain('Failed to delete the user. Status: 403');
    });
  });
});