<script setup lang="ts">
  const props = defineProps({
    size: {
      type: [String, Number],
      default: 20,
      required: false,
    }
  })
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="props.size" :height="props.size" fill="currentColor" viewBox="0 0 20 20">
    <path
      d="M10 3a1 1 0 0 1 .707.293l8 8a1 1 0 0 1-1.414 1.414L16 11.414V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.586L2.707 12.707a1 1 0 0 1-1.414-1.414l8-8A1 1 0 0 1 10 3zM6 16h8v-5a1 1 0 0 1-1-1H7a1 1 0 0 1-1 1v5z"
    />
  </svg>
</template>