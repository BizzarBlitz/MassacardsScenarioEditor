<script setup lang="ts">
import {computed, ref, useTemplateRef} from "vue"
import Border from "./Border.vue"
import ButtonOption from "./ButtonOption.vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import ExportJSONModal from "./ExportJSONModal.vue"
import generateScenarioList from "../modules/functions/generateScenarioList.mts"
import roles from "../modules/roles.mts"
import settings from "../modules/settings.mts"
import scenarioRoles from "../modules/scenarioRoles.mts"
import * as urlManager from "../modules/urlManager.mts"
import type {Alignment} from "../modules/roles.mts"

const modal = useTemplateRef("share-modal")
const jsonModal = useTemplateRef("json-modal")

defineExpose({
	show: () => {
		modal.value?.show()
	},
	hide: () => {
		modal.value?.hide()
	},
})

export type ExtraDataJSON = {
	customRoles: {
		name: string
		alignment: Alignment
		link: string
		icon: string
	}[]
}

const copyLinkIcon = ref("images/icons/link.png")
const copyListIcon = ref("images/icons/listCopy.png")
const shareLink = ref(urlManager.generateLink(scenarioRoles.value, settings.scenario.name, settings.scenario))
const shareList = computed(() => generateScenarioList(settings.scenario.name, shareLink.value, scenarioRoles.value))

function modalOpened() {
	shareLink.value = urlManager.generateLink(scenarioRoles.value, settings.scenario.name, settings.scenario)
}

function modalClosed() {
	copyLinkIcon.value = "images/icons/link.png"
	copyListIcon.value = "images/icons/listCopy.png"
}

function copyShareLink() {
	navigator.clipboard.writeText(shareLink.value)
	copyLinkIcon.value = "images/icons/check.png"
}

function copyList() {
	navigator.clipboard.writeText(shareList.value)
	copyListIcon.value = "images/icons/check.png"
}

function exportJSON() {
	jsonModal.value?.show()
}
</script>

<template>
	<ExportJSONModal :roles="scenarioRoles" ref="json-modal" />
	<Modal ref="share-modal" @opened="modalOpened" @closed="modalClosed" class="w-19/20">
		<div class="flex h-full">
			<div id="scenario-screenshot" class="flex flex-col gap-2">
				<span class="inline-block text-4xl font-bold">Take a screenshot</span>
				<div id="screenshot-container" class="overflow-auto">
					<div class="mb-1 text-center text-3xl font-bold">{{ settings.scenario.name }}</div>
					<Border class="m-2 overflow-auto">
						<div class="flex max-w-252 flex-wrap place-content-center gap-y-4">
							<div v-for="role in scenarioRoles" class="w-36 place-items-center">
								<div class="h-6 overflow-visible text-center font-bold whitespace-nowrap">
									{{
										role.isAlignmentRole
											? `Any ${role.alignment === "Unknown" ? "Role" : role.alignment}`
											: role.name
									}}
								</div>
								<div class="grid w-32 grid-cols-1 grid-rows-1">
									<img
										:src="
											role.isAlignmentRole
												? `images/alignments/${role.alignment}.png`
												: roles.getRoleIcon(role.name)
										"
										:alt="role.isAlignmentRole ? role.alignment : role.name"
										draggable="false"
										class="col-1 row-1 h-full w-full"
										style="image-rendering: pixelated"
									/>
									<div v-if="role.optional" class="col-1 row-1 p-1">
										<img
											:src="'images/alignments/Unknown.png'"
											alt="This role is optional"
											draggable="false"
											class="h-8 bg-black"
										/>
									</div>
									<div
										v-if="settings.share.shareScreenshot.showAlignments && !role.isAlignmentRole"
										class="col-1 row-1 flex items-end p-1"
									>
										<img
											:src="`images/alignments/${role.alignment}.png`"
											:alt="`${role.alignment} alignment icon`"
											draggable="false"
											class="h-8 bg-black"
										/>
									</div>
								</div>
							</div>
						</div>
					</Border>
					<div class="mt-2 flex h-8 justify-between gap-2 px-1">
						<div
							class="flex place-items-center gap-2"
							:style="{opacity: settings.scenario.gamemodes.length === 0 ? 0 : 1}"
						>
							<img
								v-for="gamemode in settings.scenario.gamemodes"
								:src="`images/icons/gamemodes/${gamemode.toLowerCase()}.png`"
								:alt="`${gamemode} gamemode icon`"
								:title="`${gamemode} gamemode icon`"
								draggable="false"
								class="h-full"
								style="image-rendering: pixelated"
							/>
							<span>{{
								settings.scenario.gamemodes.length === 1
									? `Gamemode: ${settings.scenario.gamemodes[0]}`
									: `${settings.scenario.gamemodes.length} gamemodes`
							}}</span>
						</div>
						<div
							class="flex place-items-center gap-2"
							:style="{opacity: settings.scenario.guestNumberCards === undefined ? 0 : 1}"
						>
							<span>
								Guest number cards {{ settings.scenario.guestNumberCards ? "required" : "prohibited" }}
							</span>
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
				</div>
				<hr />
				<div class="flex h-8 shrink-0 justify-end">
					<ButtonOption
						name="Show alignments"
						:options="[
							{value: false, icon: 'images/icons/maintainAlignmentsOff.png'},
							{value: true, icon: 'images/icons/maintainAlignmentsOn.png'},
						]"
						v-model="settings.share.shareScreenshot.showAlignments"
						class="h-full grow-0"
					/>
				</div>
			</div>

			<div class="mx-8 h-full w-px bg-white"></div>

			<div id="scenario-text" class="flex h-full grow flex-col">
				<span class="mb-4 inline-block text-4xl font-bold">Copy text</span>
				<div class="mb-2 flex place-content-center gap-4">
					<TextIconButton name="Copy link" :icon="copyLinkIcon" @click="copyShareLink" />
					<TextIconButton name="Copy list" :icon="copyListIcon" @click="copyList" />
					<TextIconButton name="Export JSON" icon="images/icons/json.png" @click="exportJSON" />
				</div>
				<textarea
					name="text-preview"
					id="text-preview"
					readonly="true"
					class="border-gray mb-2 w-full grow resize-none border-1 px-1"
					>{{ shareList }}</textarea
				>
				<div class="flex h-8 gap-2">
					<ButtonOption
						name="Hyperlink role wiki pages"
						:options="[
							{value: true, icon: 'images/icons/listWiki.png'},
							{value: false, icon: 'images/icons/list.png'},
						]"
						v-model="settings.share.shareList.wikiLinks"
						class="h-full grow-0"
					/>
					<ButtonOption
						name="Alignment headings"
						:options="[
							{value: true, icon: 'images/icons/listAlignment.png'},
							{value: false, icon: 'images/icons/listAlignment.png'},
						]"
						v-model="settings.share.shareList.alignmentHeadings"
						class="h-full grow-0"
					/>
					<ButtonOption
						name="Group duplicate roles"
						:options="[
							{value: true, icon: 'images/icons/listMerge.png'},
							{value: false, icon: 'images/icons/listSplit.png'},
						]"
						v-model="settings.share.shareList.groupDuplicates"
						class="h-full grow-0"
					/>
				</div>
			</div>
		</div>
	</Modal>
</template>

<style lang="css" scoped>
/* Corner borders */
#screenshot-container {
	--thickness: 5px;
	--size: calc(var(--thickness) * 3);
	--color: white;
	background:
		linear-gradient(var(--color) var(--size), transparent 0 calc(100% - var(--size)), var(--color) 0) 0 0 /
			var(--thickness) 100%,
		linear-gradient(var(--color) var(--size), transparent 0 calc(100% - var(--size)), var(--color) 0) 100% 0 /
			var(--thickness) 100%,
		linear-gradient(to right, var(--color) var(--size), transparent 0 calc(100% - var(--size)), var(--color) 0) 0 0 /
			100% var(--thickness),
		linear-gradient(to right, var(--color) var(--size), transparent 0 calc(100% - var(--size)), var(--color) 0) 0 100% /
			100% var(--thickness);
	background-repeat: no-repeat;
	padding: calc(var(--thickness) * 2) calc(var(--thickness) * 3); /* Add extra padding to account for human margin of error */
}
</style>
