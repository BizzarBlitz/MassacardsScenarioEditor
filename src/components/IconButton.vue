<script setup lang="ts">
defineProps<{
	name: string
	icon: string
}>()

const emit = defineEmits<{
	click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent) {
	event.stopPropagation()
	emit("click", event)
}
</script>

<template>
	<button
		type="button"
		:title="name"
		@click="onClick"
		class="aspect-square grow cursor-pointer transition-opacity hover:opacity-60 focus-visible:opacity-60"
	>
		<img :src="icon" :alt="name" draggable="false" class="aspect-square w-full" style="image-rendering: pixelated" />
	</button>
</template>
