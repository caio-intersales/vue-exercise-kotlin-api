import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOrders, type Order, type BasicOrderData } from '../useOrders'; 
import { nextTick } from 'vue';

// --- MOCK SETUP ---
// Define mock implementation for fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createMockResponse = (data: any, status: number, ok: boolean = true) => ({
  json: () => new Promise((resolve) => resolve(data)),
  text: () => new Promise((resolve) => resolve(JSON.stringify(data))),
  ok,
  status,
});

// Define mock data (requires mock User and Product data, imported or defined locally)
const mockUser = { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'j@d.com', deliveryAddress: '1 Test St' };
const mockProducts = [
    { id: 101, productName: 'Laptop', productType: 1, productPrice: 1200, productQnt: 5 },
    { id: 102, productName: 'Mouse', productType: 2, productPrice: 25, productQnt: 50 },
];

const mockOrders: Order[] = [
    { id: 1, orderOwner: mockUser, orderProducts: [mockProducts[0]!], issueDate: '2025-12-10T10:00:00Z' },
    { id: 2, orderOwner: mockUser, orderProducts: [mockProducts[1]!], issueDate: '2025-12-11T10:00:00Z' },
];

// Data structure used for POST/PUT requests (IDs only)
const mockBasicOrderData: BasicOrderData = {
    orderOwner: 1, // User ID
    orderProducts: [101, 102], // Product IDs
};
const mockCreatedOrder: Order = { 
    id: 3, 
    orderOwner: mockUser, 
    orderProducts: mockProducts, 
    issueDate: '2025-12-12T10:00:00Z' 
};
// --- END MOCK SETUP ---

describe('useOrders Composable', () => {
  let store: ReturnType<typeof useOrders>;

  beforeEach(() => {
    mockFetch.mockClear();
    store = useOrders(); // Creates new, isolated state
  });

  // ===============================================
  // 1. Test fetchAllOrders
  // ===============================================
  describe('fetchAllOrders', () => {
    it('should successfully fetch and populate allOrders state', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockOrders, 200));

      await store.fetchAllOrders();
      await nextTick();

      expect(store.allOrders.value).toEqual(mockOrders);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/orders/list'));
    });

    it('should handle API fetch failure (e.g., 500) and set error state', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

      await store.fetchAllOrders();
      await nextTick();

      expect(store.allOrders.value).toEqual([]);
      expect(store.error.value).toContain('HTTP error! Status: 500');
      expect(store.loading.value).toBe(false);
    });
  });

  // ===============================================
  // 2. Test fetchOrderById
  // ===============================================
  describe('fetchOrderById', () => {
    it('should successfully fetch and populate currentOrder state', async () => {
      const orderId = 1;
      const order = mockOrders[0];
      mockFetch.mockResolvedValue(createMockResponse(order, 200));

      await store.fetchOrderById(orderId);

      expect(store.currentOrder.value).toEqual(order);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/orders/show/${orderId}`));
    });

    it('should handle "Order not found" failure (404) and set error state', async () => {
      const orderId = 999;
      mockFetch.mockResolvedValue(createMockResponse({}, 404, false));

      await store.fetchOrderById(orderId);

      expect(store.currentOrder.value).toBeNull();
      expect(store.error.value).toContain('Order not found or API error (404)');
      expect(store.loading.value).toBe(false);
    });
  });

  // ===============================================
  // 3. Test createOrder (Uses BasicOrderData)
  // ===============================================
  describe('createOrder', () => {
    it('should successfully create an order and return the full created object (201)', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockCreatedOrder, 201));

      // Note: We pass the BasicOrderData (IDs), but expect the full Order back
      const result = await store.createOrder(mockBasicOrderData);

      expect(result).toEqual(mockCreatedOrder);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders/add'),
        expect.objectContaining({
          method: 'POST',
          // Assert that the request body correctly contains the BasicOrderData (IDs)
          body: JSON.stringify(mockBasicOrderData), 
        })
      );
    });

    it('should handle creation failure and return null', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, 400, false));

      const result = await store.createOrder(mockBasicOrderData);

      expect(result).toBeNull();
      expect(store.error.value).toContain('Failed to create a new order. Status: 400');
    });
  });

  // ===============================================
  // 4. Test editOrder (Uses BasicOrderData)
  // ===============================================
  describe('editOrder', () => {
    it('should successfully update an order and return the updated object (200)', async () => {
      const basicUpdateData: BasicOrderData = { id: 1, orderOwner: 2, orderProducts: [102] };
      const updatedOrder: Order = { ...mockOrders[0]!, orderOwner: { ...mockUser, id: 2 } }; // Mocked full object returned

      mockFetch.mockResolvedValue(createMockResponse(updatedOrder, 200));

      // Pass the BasicOrderData (with IDs)
      const result = await store.editOrder(basicUpdateData);

      expect(result).toEqual(updatedOrder);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders/edit'),
        expect.objectContaining({
          method: 'PUT',
          // Assert that the request body correctly contains the BasicOrderData (IDs)
          body: JSON.stringify(basicUpdateData), 
        })
      );
    });

    it('should handle update failure and return null', async () => {
      const basicUpdateData: BasicOrderData = { id: 1, orderOwner: 2, orderProducts: [102] };
      mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

      const result = await store.editOrder(basicUpdateData);

      expect(result).toBeNull();
      expect(store.error.value).toContain('Failed to update the order. Status: 500');
    });
  });

  // ===============================================
  // 5. Test deleteOrder
  // ===============================================
  describe('deleteOrder', () => {
    it('should successfully delete an order and return true (204)', async () => {
      const orderId = 1;
      mockFetch.mockResolvedValue(createMockResponse(null, 204));

      const result = await store.deleteOrder(orderId);

      expect(result).toBe(true);
      expect(store.loading.value).toBe(false);
      expect(store.error.value).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/delete/${orderId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle deletion failure and return null', async () => {
      const orderId = 999;
      mockFetch.mockResolvedValue(createMockResponse(null, 403, false));

      const result = await store.deleteOrder(orderId);

      expect(result).toBeNull();
      expect(store.error.value).toContain('Failed to delete the order. Status: 403');
    });
  });
});