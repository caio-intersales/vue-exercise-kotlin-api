import { ref } from 'vue';


// ==================================
// Interfaces
// ==================================

export interface BasicUserData {
    firstName: string;
    lastName: string;
    email: string;
    deliveryAddress: string;
}

export interface NewUser extends BasicUserData {
    rawPassword: string;
}

export interface User extends BasicUserData {
    id: number;
}

// ==================================
// Variables
// ==================================

const allUsers      = ref<User[]>([]);
const currentUser   = ref<User | null>(null);
const loading       = ref(false);
const error         = ref<string | null>(null);

const apiUrl        = "http://localhost:8080/api";

// ==================================
// "Service" part
// ==================================

export function useUsers() {   

    /**
     * Function to fetch all users from API
     */
    const fetchAllUsers = async () => {
        loading.value   = true;
        error.value     = null;

        try {
            const response = await fetch(`${apiUrl}/users/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }

            const data: User[] = await response.json();
            allUsers.value = data;
        } catch (err: any) {
            console.error(err);
            error.value = err.message || 'Failed to fetch users.';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to fetch a specific user from API based on their ID
     */
    const fetchUserById = async (id: number) => {
        loading.value = true;
        error.value = null;
        currentUser.value = null;

        try {
            const response = await fetch(`${apiUrl}/users/show/${id}`);

            if(!response.ok) {
                throw new Error(`User not found or API error (${response.status})`);
            }

            const data: User = await response.json();
            currentUser.value = data;
        } catch (err: any) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to create a new user sending a NewUser obj using POST
     */
    const createUser = async (newUser: NewUser) => {
        loading.value   = true;
        error.value     = null;
        currentUser.value = null;

        try {
            const response = await fetch(`${apiUrl}/users/add`, {
                method: 'POST', // Define POST as method
                headers: {
                    'Content-Type': "application/json", // Define the content type
                },
                body: JSON.stringify(newUser) // Send the user data
            });

            // Look for positive status
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(`Failed to create a new user. Status: ${response.status}`);
            }

            // The API returns then the created user, including its generated ID
            const createdUser: User = await response.json();

            // Success feedback
            return createdUser;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        };
        
    }

    /**
     * Function to edit an existing user sending a User obj using PUT
     */
    const editUser = async (user: User) => {
        loading.value       = true;
        error.value         = null;
        currentUser.value   = null;

        try {
            const response = await fetch(`${apiUrl}/users/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(user)
            });

            // Look for positive status
            if (response.status !== 200) {
                throw new Error(`Failed to update the user. Status: ${response.status}.`);
            }

            // The API returns the updated user
            const updatedUser: User = await response.json();

            return updatedUser;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Function to delete an user based on their ID using DELETE
     */
    const deleteUser = async (id: number) => {
        loading.value   = true;
        error.value     = null;
        currentUser.value   = null;

        try {
            const response = await fetch(`${apiUrl}/users/delete/${id}`, {
                method: 'DELETE'
            });

            // Look for a positive status
            if (response.status !== 204 && response.status !== 200) {
                throw new Error(`Failed to delete the user. Status: ${response.status}.`);
            }

            return true;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Return the reactive data and the function to use in your component
    return {
        allUsers,
        currentUser,
        loading,
        error,
        fetchAllUsers,
        fetchUserById,
        createUser,
        editUser,
        deleteUser,
    };
}