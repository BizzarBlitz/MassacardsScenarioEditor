<script setup lang="ts">
import {useTemplateRef} from "vue"
import Border from "./Border.vue"
import IconButton from "./IconButton.vue"

const emit = defineEmits<{
	opened: []
	closed: []
}>()

defineExpose({
	show: showModal,
	hide: hideModal,
})

const modal = useTemplateRef("modal")

function showModal() {
	modal.value?.showModal()
	emit("opened")
}

function hideModal() {
	modal.value?.close()
	emit("closed")
}

function onModalClicked(event: MouseEvent) {
	// Only close when backdrop is clicked
	if (event.target === event.currentTarget) {
		hideModal()
	}
}
</script>

<template>
	<dialog
		@click="onModalClicked"
		ref="modal"
		class="m-auto overflow-visible bg-transparent text-white backdrop:bg-black backdrop:opacity-75"
	>
		<Border background="black" class="max-h-[85vh] p-4 px-6 text-center">
			<div class="absolute right-[15px] bottom-full mb-2 flex h-8 place-content-end">
				<IconButton name="Close" icon="images/icons/close.png" @click="hideModal" class="grow-0" />
			</div>
			<slot />
		</Border>
	</dialog>
</template>
