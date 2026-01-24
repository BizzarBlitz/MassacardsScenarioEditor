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
		class="flex cursor-pointer items-center justify-center gap-2 border-10 transition-opacity hover:opacity-60 focus-visible:opacity-60"
		style="border-image-source: url(images/roundedBackground.png); border-image-slice: calc(2 * 16) fill"
	>
		<img
			:src="icon"
			:alt="name"
			draggable="false"
			class="aspect-square h-8 w-8 brightness-0"
			style="image-rendering: pixelated"
		/>
		<span class="text-2xl font-bold text-black">{{ name }}</span>
	</button>
</template>
