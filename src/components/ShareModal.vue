<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Border from "./Border.vue"
import IconButton from "./IconButton.vue"
import settings from "../modules/settings.mts"
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
const copyLinkIcon = ref("images/icons/link.png")
const copyListIcon = ref("images/icons/list.png")
const copyWikiListIcon = ref("images/icons/wikiList.png")

function showModal() {
	modal.value?.showModal()
}
function hideModal() {
	modal.value?.close()
	copyLinkIcon.value = "images/icons/link.png"
	copyListIcon.value = "images/icons/list.png"
	copyWikiListIcon.value = "images/icons/wikiList.png"
}

function onModalClicked(event: MouseEvent) {
	// Only close when backdrop is clicked
	if (event.target === event.currentTarget) {
		hideModal()
	}
}

function getListHeader() {
	return `## [${props.scenarioName}](<${urlManager.generateLink(props.roles, props.scenarioName, settings.scenario)}>)`
}

function copyShareLink() {
	const shareLink = urlManager.generateLink(props.roles, props.scenarioName, settings.scenario)
	navigator.clipboard.writeText(shareLink)
	copyLinkIcon.value = "images/icons/check.png"
}

function copyList() {
	let list = getListHeader()

	props.roles.forEach((role) => {
		if (role.isAlignmentRole) {
			list += `\n- Any ${role.alignment === "Unknown" ? "Role" : role.alignment}`
		} else {
			list += `\n- ${role.name}`
		}
	})

	navigator.clipboard.writeText(list)
	copyListIcon.value = "images/icons/check.png"
}

function copyWikiList() {
	let list = getListHeader()

	props.roles.forEach((role) => {
		if (role.isAlignmentRole) {
			list += `\n- Any [${role.alignment === "Unknown" ? "Role" : role.alignment}](<https://massacards.miraheze.org/wiki/${role.alignment.replaceAll(" ", "_")}_Alignment>)`
		} else {
			list += `\n- [${role.name}](<https://massacards.miraheze.org/wiki/${role.name.replaceAll(" ", "_")}>)`
		}
	})

	navigator.clipboard.writeText(list)
	copyWikiListIcon.value = "images/icons/check.png"
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
				<IconButton name="Close" icon="images/icons/close.png" @click="hideModal" class="grow-0" />
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
									? `images/alignments/${role.alignment}.png`
									: `images/roles/${role.name}.png`
							"
							:alt="role.isAlignmentRole ? role.alignment : role.name"
							draggable="false"
							class="w-32"
						/>
					</div>
				</div>
			</Border>
			<div class="text-gray mt-2 flex h-8 justify-between px-1">
				<div
					class="flex place-items-center gap-2"
					:style="{opacity: settings.scenario.gamemode === undefined ? 0 : 1}"
				>
					<img
						:src="`images/icons/gamemodes/${settings.scenario.gamemode?.toLowerCase() || 'normal'}.png`"
						:alt="`Gamemode: ${settings.scenario.gamemode}`"
						:title="`Gamemode: ${settings.scenario.gamemode}`"
						draggable="false"
						class="h-full"
						style="image-rendering: pixelated"
					/>
					<span>Gamemode: {{ settings.scenario.gamemode }}</span>
				</div>
				<div
					class="flex place-items-center gap-2"
					:style="{opacity: settings.scenario.guestNumberCards === undefined ? 0 : 1}"
				>
					<span>Guest number cards {{ settings.scenario.guestNumberCards ? "required" : "prohibited" }}</span>
					<img
						:src="`images/icons/${settings.scenario.guestNumberCards ? 'guestNumberCards' : 'guestNumberCardsOff'}.png`"
						:alt="`Guest number cards ${settings.scenario.guestNumberCards ? 'required' : 'prohibited'}`"
						:title="`Guest number cards ${settings.scenario.guestNumberCards ? 'required' : 'prohibited'}`"
						draggable="false"
						class="h-full"
						style="image-rendering: pixelated"
					/>
				</div>
			</div>
			<div class="mt-4 mb-2 flex h-8 place-content-end gap-2">
				<IconButton name="Copy list" :icon="copyListIcon" @click="copyList" class="grow-0" />
				<IconButton name="Copy list with wiki links" :icon="copyWikiListIcon" @click="copyWikiList" class="grow-0" />
				<IconButton name="Copy link" :icon="copyLinkIcon" @click="copyShareLink" class="grow-0" />
			</div>
		</Border>
	</dialog>
</template>
