<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { BasicUserData, User } from '@/composables/useUsers';
import { useUsers } from '@/composables/useUsers';
import UserForm from '@/components/UserForm.vue';

// Define the full structure of the data expected by the form component
interface FormInputData extends BasicUserData {
    rawPassword?: string;
    id?: number; 
}

const router    = useRouter();
const route     = useRoute(); // This gets the current route instance
const { currentUser, fetchUserById, editUser, loading, error } = useUsers();

// 1. Initial State: Defines the empty data object passed to the form
const initialFormState = ref<FormInputData>({
    firstName: '',
    lastName: '',
    email: '',
    rawPassword: undefined, // Initialise password field as undefined
    deliveryAddress: '',
    id: undefined, // Initialise ID as undefined
});

const loadUser = (id: string | string[] | undefined) => {
    // 1. Check for 'undefined' (or null) first
    if (!id) {
        // Handle case where ID is missing, e.g., redirect or log error
        console.error("No ID found in route parameters.");
        return;
    }

    let userIdString: string;

    // Check whether it is an array and, if so, use only one
    if(Array.isArray(id)){
        userIdString = id[0]!;
    } else {
        userIdString = id;
    }

    // Turn into int (number)
    const userId = parseInt(userIdString);

    if(!isNaN(userId)){
        fetchUserById(userId);
    }
}

watch(currentUser, (user) => {
    if (user) {
        // This maps the fetched user to the initialFormState
        initialFormState.value = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            deliveryAddress: user.deliveryAddress,
            rawPassword: '', // Keep it empty on edit
        }
    }
}, { immediate: true });

const handleUpdate = async (formData: FormInputData) => {
    // Simple client-side validation
    if (!formData.firstName || !formData.email || !formData.id) {
        alert("user data or ID missing.");
        return;
    }

    // Call the composable
    const success = await editUser(formData as User);

    if(success) {
        alert("User updated successfully!");
        router.push({
            name: "user-info",
            params: { id: formData.id }
        });
    }
};

onMounted(() => {
    loadUser(route.params.id);
});

watch(
    () => route.params.id,
    (newId) => loadUser(newId),
    { immediate: false }
);
</script>

<template>
    <div>
        <h2>Edit user</h2>

        <UserForm 
            mode="edit" 
            :initial-data="initialFormState" 
            :loading="loading" 
            :error="error" 
            submit-text="Edit user" 
            @submit-form="handleUpdate"
        />
    </div>
</template>