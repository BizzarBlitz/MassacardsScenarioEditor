<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"

const modal = useTemplateRef("delete-data-modal")
defineExpose({
	show: () => {
		modal.value?.show()
	},
	hide: () => {
		modal.value?.hide()
	},
})

const deletePersistentIcon = ref("images/icons/trash.png")
const deleteSessionIcon = ref("images/icons/trash.png")

function deletePersistentData() {
	deletePersistentIcon.value = "images/icons/check.png"
	localStorage.clear()
}

function deleteSessionData() {
	deleteSessionIcon.value = "images/icons/check.png"
	sessionStorage.clear()
}

function onModalClosed() {
	deletePersistentIcon.value = "images/icons/trash.png"
	deleteSessionIcon.value = "images/icons/trash.png"
}
</script>

<template>
	<Modal ref="delete-data-modal" @closed="onModalClosed">
		<h2 class="text-3xl font-bold">Delete stored data</h2>
		Data is locally stored on your browser using <code>localStorage</code> and <code>sessionStorage</code> to save your
		settings between browser sessions and page refreshes respectively.<br />
		<b>Local browser data is not tracked or stored anywhere but on your own device.</b>
		<div class="mt-4 flex flex-row place-content-center gap-4">
			<TextIconButton name="Delete persistent data" :icon="deletePersistentIcon" @click="deletePersistentData" />
			<TextIconButton name="Delete session data" :icon="deleteSessionIcon" @click="deleteSessionData" />
		</div>
	</Modal>
</template>
