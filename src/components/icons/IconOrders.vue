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
      d="M13 2H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM7 17V3h6v14H7zM9 5h2a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2zm-1 5h4a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2zm0 3h4a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2zm0 3h4a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2z"
    />
  </svg>
</template>