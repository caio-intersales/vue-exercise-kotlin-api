// ==================================
// Interfaces
// ==================================

import { ref } from "vue";

export interface BasicProductData {
    productName: string;
    productType: number;
    productPrice: DoubleRange;
    productQnt: number;
}

export interface Product extends BasicProductData {
    id: number;
}

// ==================================
// Variables
// ==================================

const allProducts       = ref<Product[]>([]);
const currentProduct    = ref<Product | null>(null);
const loading           = ref(false);
const error             = ref<string | null>(null);

const apiUrl            = import.meta.env.VITE_BASE_API_URL;

// ==================================
// "Service" part
// ==================================

export function useProducts() {

    /**
     * Function to fetch all products from API
     */
    const fetchAllProducts = async () => {
        loading.value   = true;
        error.value     = null;

        try {
            const response = await fetch(`${apiUrl}/products/list`);
            if (!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data: Product[] = await response.json();
            allProducts.value = data;
        } catch (err: any) {
            console.error(err);
            error.value = err.message || 'Failed to fetch products.';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to fetch a specific product from API based on their ID
     */
    const fetchProductById = async (id: number) => {
        loading.value       = true;
        error.value         = null;
        currentProduct.value= null;

        try {
            const response = await fetch(`${apiUrl}/products/show/${id}`);

            if (!response.ok) {
                throw new Error(`Product not found or API error (${response.status})`);
            }

            const data: Product = await response.json();
            currentProduct.value = data;
        } catch (err: any) {
            console.error(err);
            error.value = err.message || 'Failed to fetch product.';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to create a new product sending a NewProduct obj using POST
     */
    const createProduct = async (newProduct: BasicProductData) => {
        loading.value       = true;
        error.value         = null;
        currentProduct.value= null;

        try {
            const response = await fetch(`${apiUrl}/products/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(newProduct)
            });

            // Look for positive status
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(`Failed to create a new product. Status: ${response.status}.`);
            }

            // The API returns then the created product, including its generated ID
            const createdProduct: Product = await response.json();

            // Success feedback
            return createdProduct;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        };
    }

    /**
     * Function to edit an existing product sending a Product obj usign PUT
     */
    const editProduct = async (product: Product) => {
        loading.value       = true;
        error.value         = null;
        currentProduct.value= null;

        try {
            const response = await fetch(`${apiUrl}/products/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(product)
            });

            // Look for positive status
            if (response.status !== 200) {
                throw new Error(`Failed to update the product. Status: ${response.status}.`)
            }

            // API returns updated product
            const updatedProduct: Product = await response.json();

            return updatedProduct;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to delete a product based on its ID using DELETE
     */
    const deleteProduct = async (id: number) => {
        loading.value       = true;
        error.value         = null;
        currentProduct.value= null;

        try {
            const response = await fetch(`${apiUrl}/products/delete/${id}`, {
                method: 'DELETE'
            });

            // Look for a positive status
            if (response.status !== 204 && response.status !== 200) {
                throw new Error(`Failed to delete the product. Status: ${response.status}.`);
            }

            return true;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Return the reactive data and the functions to use in the component
    return {
        allProducts,
        currentProduct,
        loading,
        error,
        fetchAllProducts,
        fetchProductById,
        createProduct,
        editProduct,
        deleteProduct,
    }
}