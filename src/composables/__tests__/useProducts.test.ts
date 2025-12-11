import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProducts, type Product, type BasicProductData } from '../useProducts'; 
import { nextTick } from 'vue';

// --- MOCK SETUP ---
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createMockResponse = (data: any, status: number, ok: boolean = true) => ({
  json: () => new Promise((resolve) => resolve(data)),
  text: () => new Promise((resolve) => resolve(JSON.stringify(data))),
  ok,
  status,
});

// Define mock data
const mockProducts: Product[] = [
    { id: 101, productName: 'Laptop', productType: 1, productPrice: 1200.00, productQnt: 5 },
    { id: 102, productName: 'Mouse', productType: 2, productPrice: 25.00, productQnt: 50 },
];

const mockNewProduct: BasicProductData = {
    productName: 'Keyboard', productType: 2, productPrice: 75.00, productQnt: 10
};
const mockCreatedProduct: Product = { id: 103, ...mockNewProduct };
// --- END MOCK SETUP ---

describe('useProducts Composable', () => {
    let store: ReturnType<typeof useProducts>;

    beforeEach(() => {
            mockFetch.mockClear();
            store = useProducts();
        
    });

  // ===============================================
  // 1. Test fetchAllProducts
  // ===============================================
  describe('fetchAllProducts', () => {
    it('should successfully fetch and populate allProducts state', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockProducts, 200));

        const promise = store.fetchAllProducts();
        expect(store.loading.value).toBe(true);

        await promise;
        await nextTick();

        expect(store.allProducts.value).toEqual(mockProducts);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/products/list'));
    });

    it('should handle API fetch failure (e.g., 500) and set error state', async () => {
        mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

        await store.fetchAllProducts();
        await nextTick();

        expect(store.allProducts.value).toEqual([]);
        expect(store.error.value).toContain('HTTP error! Status: 500');
        expect(store.loading.value).toBe(false);
    });
  });

  // ===============================================
  // 2. Test fetchProductById
  // ===============================================
  describe('fetchProductById', () => {
    it('should successfully fetch and populate currentProduct state', async () => {
        const productId = 101;
        const product = mockProducts[0];
        mockFetch.mockResolvedValue(createMockResponse(product, 200));

        await store.fetchProductById(productId);

        expect(store.currentProduct.value).toEqual(product);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/products/show/${productId}`));
    });

    it('should handle "Product not found" failure (404) and set error state', async () => {
        const productId = 999;
        mockFetch.mockResolvedValue(createMockResponse({}, 404, false));

        await store.fetchProductById(productId);

        expect(store.currentProduct.value).toBeNull();
        expect(store.error.value).toContain('Product not found or API error (404)');
        expect(store.loading.value).toBe(false);
    });
  });

  // ===============================================
  // 3. Test createProduct
  // ===============================================
  describe('createProduct', () => {
    it('should successfully create a product and return the created object (201)', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockCreatedProduct, 201));

        const result = await store.createProduct(mockNewProduct);

        expect(result).toEqual(mockCreatedProduct);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/add'),
            expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(mockNewProduct),
            })
        );
        });

        it('should handle creation failure and return null', async () => {
        mockFetch.mockResolvedValue(createMockResponse({}, 400, false));

        const result = await store.createProduct(mockNewProduct);

        expect(result).toBeNull();
        expect(store.error.value).toContain('Failed to create a new product. Status: 400');
    });
  });

  // ===============================================
  // 4. Test editProduct
  // ===============================================
  describe('editProduct', () => {
    it('should successfully update a product and return the updated object (200)', async () => {
        
        const productBase = mockProducts[0]! as Product; // To avoid TS throwing error over null ID

        const updatedProduct: Product = { ...productBase, productName: 'Laptop Pro' };
        mockFetch.mockResolvedValue(createMockResponse(updatedProduct, 200));

        const result = await store.editProduct(updatedProduct);

        expect(result).toEqual(updatedProduct);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/products/edit'),
            expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updatedProduct),
            })
        );
    });

    it('should handle update failure and return null', async () => {
        
        const productBase = mockProducts[0]! as Product; // To avoid TS throwing error over null ID

        const productToUpdate: Product = { ...productBase, productName: 'Failed Update' };
        mockFetch.mockResolvedValue(createMockResponse({}, 500, false));

        const result = await store.editProduct(productToUpdate);

        expect(result).toBeNull();
        expect(store.error.value).toContain('Failed to update the product. Status: 500');
    });
  });

  // ===============================================
  // 5. Test deleteProduct
  // ===============================================
  describe('deleteProduct', () => {
        it('should successfully delete a product and return true (204)', async () => {
        const productId = 101;
        // Mock 204 No Content for a successful deletion
        mockFetch.mockResolvedValue(createMockResponse(null, 204));

        const result = await store.deleteProduct(productId);

        expect(result).toBe(true);
        expect(store.loading.value).toBe(false);
        expect(store.error.value).toBeNull();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(`/products/delete/${productId}`),
            expect.objectContaining({
            method: 'DELETE',
            })
        );
        });

        it('should handle deletion failure and return null', async () => {
        const productId = 999;
        mockFetch.mockResolvedValue(createMockResponse(null, 403, false));

        const result = await store.deleteProduct(productId);

        expect(result).toBeNull();
        expect(store.error.value).toContain('Failed to delete the product. Status: 403');
        });
  });
});