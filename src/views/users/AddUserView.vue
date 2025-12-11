<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { BasicUserData, NewUser } from '@/composables/useUsers';
import { useUsers } from '@/composables/useUsers';
import UserForm from '@/components/UserForm.vue';

// Define the full structure of the data expected by the form component
interface FormInputData extends BasicUserData {
    rawPassword?: string;
    id?: number; 
}

const router = useRouter();
const { createUser, loading, error } = useUsers();

// 1. Initial State: Defines the empty data object passed to the form
const initialFormState = ref<FormInputData>({
    firstName: '',
    lastName: '',
    email: '',
    rawPassword: '', // Initialise password field for creation
    deliveryAddress: '',
});

// 2. Event Handler: Receives the cleaned data from UserForm and calls the API
const handleSubmit = async (formData: FormInputData) => { 
    
    // Simple client-side validation
    if (!formData.firstName || !formData.email) { 
        alert("First Name and Email are required.");
        return;
    }
    
    // Cast the payload to NewUser (which createUser expects), as FormInputData is compatible
    const createdUser = await createUser(formData as NewUser);

    if (createdUser) {
        alert("User added successfully! You'll be redirected to the user's page.")
        // 3. Redirection on success
        router.push({ 
            name: 'user-info',
            params: { id: createdUser.id } 
        });
    }
};
</script>

<template>
    <div class="container">
        <h2>Add new user</h2>

        <UserForm 
            mode="create" 
            :initial-data="initialFormState" 
            :loading="loading" 
            :error="error" 
            submit-text="Create new user" 
            @submit-form="handleSubmit"
        />
    </div>
</template>