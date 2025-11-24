<script setup lang="ts">
import {computed, ref, useTemplateRef} from "vue"
import Border from "./Border.vue"
import ButtonOption from "./ButtonOption.vue"
import IconButton from "./IconButton.vue"
import TextIconButton from "./TextIconButton.vue"
import generateScenarioList from "../modules/functions/generateScenarioList.mts"
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
const copyListIcon = ref("images/icons/copy.png")
const shareLink = ref(urlManager.generateLink(props.roles, props.scenarioName, settings.scenario))
const shareList = computed(() => generateScenarioList(props.scenarioName, shareLink.value, props.roles))

function showModal() {
	shareLink.value = urlManager.generateLink(props.roles, props.scenarioName, settings.scenario)
	modal.value?.showModal()
}
function hideModal() {
	modal.value?.close()
	copyLinkIcon.value = "images/icons/link.png"
	copyListIcon.value = "images/icons/copy.png"
}

function onModalClicked(event: MouseEvent) {
	// Only close when backdrop is clicked
	if (event.target === event.currentTarget) {
		hideModal()
	}
}

function copyShareLink() {
	navigator.clipboard.writeText(shareLink.value)
	copyLinkIcon.value = "images/icons/check.png"
}

function copyList() {
	navigator.clipboard.writeText(shareList.value)
	copyListIcon.value = "images/icons/check.png"
}
</script>

<template>
	<dialog
		@click="onModalClicked"
		ref="share-modal"
		class="m-auto max-h-[90%] w-19/20 overflow-visible bg-transparent text-white backdrop:bg-black backdrop:opacity-75"
	>
		<Border background="black" class="p-4 px-6 text-center">
			<div id="close-share-modal" class="absolute right-[15px] bottom-full mb-2 flex h-8 place-content-end">
				<IconButton name="Close" icon="images/icons/close.png" @click="hideModal" class="grow-0" />
			</div>

			<div class="flex h-full">
				<div id="scenario-screenshot" class="flex flex-col gap-2">
					<span class="inline-block text-4xl font-bold">Take a screenshot</span>
					<div id="screenshot-container" class="overflow-auto">
						<div class="mb-1 text-center text-3xl font-bold">{{ scenarioName }}</div>
						<Border class="m-2 overflow-auto">
							<div class="flex max-w-252 flex-wrap place-content-center gap-y-4">
								<div v-for="role in roles" class="w-36 place-items-center">
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
													: `images/roles/${role.name}.png`
											"
											:alt="role.isAlignmentRole ? role.alignment : role.name"
											draggable="false"
											class="col-1 row-1"
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
											v-if="settings.shareScreenshot.showAlignments && !role.isAlignmentRole"
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
						<div class="mt-2 flex h-8 justify-between px-1">
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
					<div class="flex h-8 justify-end">
						<ButtonOption
							name="Show alignments"
							:options="[
								{value: false, icon: 'images/icons/maintainAlignmentsOff.png'},
								{value: true, icon: 'images/icons/maintainAlignmentsOn.png'},
							]"
							v-model="settings.shareScreenshot.showAlignments"
							class="h-full grow-0"
						/>
					</div>
				</div>

				<div class="mx-8 h-full w-px bg-white"></div>

				<div id="scenario-text" class="flex h-full grow flex-col">
					<span class="mb-4 inline-block text-4xl font-bold">Copy text</span>
					<div class="mb-2 flex place-content-center gap-4">
						<TextIconButton name="Copy link" :icon="copyLinkIcon" @click="copyShareLink" />
						<span class="self-center text-xl font-semibold">OR</span>
						<TextIconButton name="Copy list" :icon="copyListIcon" @click="copyList" />
					</div>
					<textarea
						name="list-preview"
						id="list-preview"
						readonly="true"
						class="mb-2 w-full grow resize-none border-1 px-1"
						>{{ shareList }}</textarea
					>
					<div class="flex h-8 gap-2">
						<ButtonOption
							name="Hyperlink role wiki pages"
							:options="[
								{value: true, icon: 'images/icons/listWiki.png'},
								{value: false, icon: 'images/icons/list.png'},
							]"
							v-model="settings.shareList.wikiLinks"
							class="h-full grow-0"
						/>
						<ButtonOption
							name="Alignment headings"
							:options="[
								{value: true, icon: 'images/icons/listAlignment.png'},
								{value: false, icon: 'images/icons/listAlignment.png'},
							]"
							v-model="settings.shareList.alignmentHeadings"
							class="h-full grow-0"
						/>
						<ButtonOption
							name="Group duplicate roles"
							:options="[
								{value: true, icon: 'images/icons/listMerge.png'},
								{value: false, icon: 'images/icons/listSplit.png'},
							]"
							v-model="settings.shareList.groupDuplicates"
							class="h-full grow-0"
						/>
					</div>
				</div>
			</div>
		</Border>
	</dialog>
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
