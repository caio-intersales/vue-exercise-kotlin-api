<script setup lang="ts">
    defineProps<{
        mainMsg: string
        subMsg: string
    }>()
</script>

<template>
    <div class="greetings">
        <h1 class="blue">{{ mainMsg }}</h1>
        <h3>{{ subMsg }}</h3>
    </div>
</template>

<style scoped>
    h1 {
        font-weight: 500;
        font-size: 3rem;
        position: relative;
        top: -10px;
    }

    h3 {
        font-size: 1.5rem;
    }

    .greetings h1,
    .greetings h3 {
        text-align: center;
    }

    @media (min-width: 1000px) {
        .greetings h1,
        .greetings h3 {
            text-align: center;
        }
    }
</style>