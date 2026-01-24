<script setup lang="ts">
defineProps<{
	name: string
}>()
</script>

<template>
	<div class="config-section">
		<h2 class="mb-2 text-left text-3xl font-semibold">{{ name }}</h2>
		<slot />
	</div>
</template>
