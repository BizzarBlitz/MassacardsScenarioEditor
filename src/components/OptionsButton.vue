<script setup lang="ts">
import IconButton from "./IconButton.vue"

defineProps<{
	name: string
	icon: string
	slotCount: number
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
	<div id="scenario-button" class="grid aspect-square grid-cols-1 grid-rows-1" :style="'--slot-count:' + slotCount">
		<IconButton :name :icon @click="onClick" class="peer z-10 col-1 row-1" />
		<div id="options-container" class="col-1 row-end-2 flex w-full flex-col-reverse pb-8 transition-[clip-path,margin]">
			<slot />
		</div>
	</div>
</template>

<style scoped>
#options-container {
	--gap: 0.5rem;
	--container-height: calc((100% + var(--gap)) * var(--slot-count));
	--negative-container-height: calc(-1 * var(--container-height));

	margin-top: calc(var(--container-height));
	clip-path: polygon(
		-1px var(--negative-container-height),
		100% var(--negative-container-height),
		100% calc(2 * var(--negative-container-height)),
		-1px calc(2 * var(--negative-container-height))
	);
}

#options-container:hover,
.peer:hover ~ #options-container {
	margin-top: 0;
	clip-path: polygon(-1px 0, 100% 0, 100% var(--negative-container-height), -1px var(--negative-container-height));
}

#options-container > * {
	padding-bottom: var(--gap);
	aspect-ratio: unset;
}
</style>
