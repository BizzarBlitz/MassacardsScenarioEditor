<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Border from "./Border.vue"
import IconButton from "./IconButton.vue"
import * as urlManager from "../modules/urlManager.mts"
import type {RoleData} from "../modules/roles.mts"

const props = defineProps<{
	scenarioName: string
	roles: RoleData[]
}>()

defineExpose({
	show: showModal,
	hide: hideModal,
})

const modal = useTemplateRef("share-modal")
const copyLinkIcon = ref("../../images/icons/link.png")

function showModal() {
	modal.value?.showModal()
}
function hideModal() {
	modal.value?.close()
	copyLinkIcon.value = "../../images/icons/link.png"
}

function onModalClicked(event: MouseEvent) {
	// Only close when backdrop is clicked
	if (event.target === event.currentTarget) {
		hideModal()
	}
}

function copyShareLink() {
	const shareLink = urlManager.generateLink(props.roles, props.scenarioName)
	navigator.clipboard.writeText(shareLink)
	copyLinkIcon.value = "../../images/icons/check.png"
}
</script>

<template>
	<dialog
		@click="onModalClicked"
		ref="share-modal"
		class="m-auto max-h-[90%] max-w-[80%] overflow-visible bg-transparent text-white backdrop:bg-black backdrop:opacity-75"
	>
		<Border background="black" class="m-4 mb-0">
			<div class="absolute right-[15px] bottom-full mb-2 flex h-8 place-content-end">
				<IconButton name="Close" icon="../../images/icons/close.png" @click="hideModal" class="grow-0" />
			</div>
			<div class="mb-1 text-center text-3xl font-bold">{{ scenarioName }}</div>
			<Border class="m-2 overflow-auto">
				<div class="flex flex-wrap place-content-center gap-4">
					<div v-for="role in roles">
						<div class="text-center font-bold">
							{{
								role.isAlignmentRole
									? `Any ${role.alignment === "Unknown" ? "Role" : role.alignment}`
									: role.name
							}}
						</div>
						<img
							:src="
								role.isAlignmentRole
									? `../../images/alignments/${role.alignment}.png`
									: `../../images/roles/${role.name}.png`
							"
							:alt="role.isAlignmentRole ? role.alignment : role.name"
							draggable="false"
							class="w-32"
						/>
					</div>
				</div>
			</Border>
			<div class="mt-4 mb-2 flex h-8 place-content-end">
				<IconButton name="Copy link" :icon="copyLinkIcon" @click="copyShareLink" class="grow-0" />
			</div>
		</Border>
	</dialog>
</template>
