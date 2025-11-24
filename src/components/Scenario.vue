<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Border from "./Border.vue"
import ButtonOption from "./ButtonOption.vue"
import IconButton from "./IconButton.vue"
import Role from "./Role.vue"
import ScenarioButtons from "./ScenarioButtons.vue"
import settings from "../modules/settings.mts"
import * as urlManager from "../modules/urlManager.mts"

import {useSortable} from "@vueuse/integrations/useSortable"

const emit = defineEmits<{
	buttonClicked: [name: string, event: MouseEvent]
}>()

const MAX_ROLES = 13

const linkData = urlManager.parseLink(window.location.hash)
const roles = ref(urlManager.generateRolesFromNames(linkData.roleNames))
const name = ref(linkData.name || "Click to edit scenario name")

settings.scenario.gamemode = linkData.scenarioSettings.gamemode
settings.scenario.guestNumberCards = linkData.scenarioSettings.guestNumberCards

defineExpose({
	roles,
	name,
})

const scenarioButtons = useTemplateRef("scenario-buttons")
const container = useTemplateRef("role-container")
useSortable(container, roles, {
	handle: ".role-icon-container",
	animation: 100,
})

function deleteRole() {
	roles.value.pop()
}

function preventAutoscroll(event: MouseEvent) {
	// 1 == middle mouse button
	if (event.button === 1) {
		event.preventDefault()
	}
}
</script>

<template>
	<div class="m-auto mt-32 mb-4 w-7/8" id="scenario">
		<!-- Button: 2rem, Gap: 0.5rem -->
		<div class="mb-1 grid h-8 w-full grid-cols-[9.5rem_1fr_9.5rem] grid-rows-1">
			<div class="flex gap-2">
				<ButtonOption
					:name="`${
						settings.scenario.guestNumberCards === undefined
							? 'Toggle guest number cards'
							: `Guest number cards: ${settings.scenario.guestNumberCards ? 'Enabled' : 'Disabled'}`
					}`"
					:options="[
						{value: undefined, icon: 'images/icons/guestNumberCards.png'},
						{value: true, icon: 'images/icons/guestNumberCardsOn.png'},
						{value: false, icon: 'images/icons/guestNumberCardsOff.png'},
					]"
					v-model="settings.scenario.guestNumberCards"
					class="grow-0"
				/>
				<ButtonOption
					:name="`Gamemode: ${settings.scenario.gamemode || 'Normal'}`"
					:options="[
						{value: undefined, icon: 'images/icons/gamemodes/normal.png'},
						{value: 'Massacre', icon: 'images/icons/gamemodes/massacre.png'},
						{value: 'Investigator', icon: 'images/icons/gamemodes/investigator.png'},
						{value: 'Apocalypse', icon: 'images/icons/gamemodes/apocalypse.png'},
						{value: 'Ritual', icon: 'images/icons/gamemodes/ritual.png'},
						{value: 'Flashlight', icon: 'images/icons/gamemodes/flashlight.png'},
						{value: 'Feast', icon: 'images/icons/gamemodes/feast.png'},
						{value: 'Deathless', icon: 'images/icons/gamemodes/deathless.png'},
						{value: 'Afterlife', icon: 'images/icons/gamemodes/afterlife.png'},
					]"
					v-model="settings.scenario.gamemode"
					class="grow-0"
				/>
			</div>
			<input
				type="text"
				placeholder="No scenario name"
				autocomplete="off"
				v-model="name"
				onclick="this.select() // Highlight text on click"
				name="scenario-name"
				id="scenario-name"
				class="placeholder:text-gray col-2 text-center text-3xl font-bold focus:outline-0"
			/>
			<ScenarioButtons ref="scenario-buttons" v-model="roles" @button-clicked="emit" />
		</div>
		<Border class="grid min-h-47 grid-cols-1 grid-rows-1">
			<div
				v-show="roles.length === 0"
				class="text-gray col-1 row-1 h-47 w-full place-content-center text-center text-2xl select-none"
			>
				Click anywhere to add a role or use the 'Add role' button<br />Middle click anywhere to delete the rightmost
				role
			</div>
			<div
				ref="role-container"
				@click="scenarioButtons!.addRole"
				@click.middle="deleteRole"
				@mousedown="preventAutoscroll"
				class="col-1 row-1 flex flex-wrap place-content-center gap-y-6 select-none"
			>
				<Role
					v-for="(roleData, index) in roles"
					:key="roleData.id"
					:role-data="roleData"
					:index="index"
					v-model="roles"
					:id="roleData.name"
				/>
			</div>
		</Border>
		<div class="mt-2 flex h-8 w-full justify-end gap-2">
			<div class="place-content-center text-right">
				<abbr
					v-if="roles.length > MAX_ROLES"
					title="A max of 13 roles is recommended"
					class="decoration-red cursor-help underline-offset-4"
				>
					{{ roles.length }} roles<span> (!)</span>
				</abbr>
				<span v-else>{{ roles.length }} roles</span>
			</div>
			<IconButton name="Delete all roles" icon="images/icons/trash.png" @click="roles.length = 0" class="grow-0" />
		</div>
	</div>
</template>
