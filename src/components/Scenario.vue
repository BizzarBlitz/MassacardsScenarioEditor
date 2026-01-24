<script setup lang="ts">
import {reactive, ref, useTemplateRef, watch} from "vue"
import Border from "./Border.vue"
import ButtonOption from "./ButtonOption.vue"
import IconButton from "./IconButton.vue"
import Role from "./Role.vue"
import ScenarioButtons from "./ScenarioButtons.vue"
import settings from "../modules/settings.mts"
import scenarioRoles from "../modules/scenarioRoles.mts"
import * as urlManager from "../modules/urlManager.mts"

import {useSortable} from "@vueuse/integrations/useSortable"
import OptionsButton from "./OptionsButton.vue"

const emit = defineEmits<{
	buttonClicked: [name: string, event: MouseEvent]
}>()

const MAX_ROLES = 13

const linkData = urlManager.parseLink(window.location.hash)
settings.scenario.gamemodes = linkData.scenarioSettings.gamemodes
settings.scenario.guestNumberCards = linkData.scenarioSettings.guestNumberCards

const scenarioButtons = useTemplateRef("scenario-buttons")
const container = useTemplateRef("role-container")
useSortable(container, scenarioRoles, {
	handle: ".role-icon-container",
	animation: 100,
})

watch(settings.userSettings.customRoles, (customRoles) => {
	scenarioRoles.value.forEach((role) => {
		if (role.isAlignmentRole) return

		const customRole = customRoles.find((customRole) => {
			return customRole.name === role.name
		})

		if (customRole) {
			role.name = customRole.name
			role.alignment = customRole.alignment
		}
	})
})

const gamemodeMenuIcon = ref("images/icons/gamemodes/normal.png")

const gamemodes = reactive({
	Massacre: settings.scenario.gamemodes.includes("Massacre"),
	Investigator: settings.scenario.gamemodes.includes("Investigator"),
	Apocalypse: settings.scenario.gamemodes.includes("Apocalypse"),
	Ritual: settings.scenario.gamemodes.includes("Ritual"),
	Flashlight: settings.scenario.gamemodes.includes("Flashlight"),
	Feast: settings.scenario.gamemodes.includes("Feast"),
	Deathless: settings.scenario.gamemodes.includes("Deathless"),
	Afterlife: settings.scenario.gamemodes.includes("Afterlife"),
})

watch(gamemodes, (gamemodes) => {
	const appliedGamemodes = []

	for (const [gamemode, enabled] of Object.entries(gamemodes)) {
		if (enabled) {
			appliedGamemodes.push(gamemode)
		}
	}

	if (appliedGamemodes.length === 0) {
		gamemodeMenuIcon.value = "images/icons/gamemodes/normal.png"
	} else if (appliedGamemodes.length === 1) {
		gamemodeMenuIcon.value = "images/icons/gamemodes/" + appliedGamemodes[0].toLowerCase() + ".png"
	} else {
		gamemodeMenuIcon.value = "images/icons/gamemodeCounts/gamemode" + appliedGamemodes.length + ".png"
	}

	settings.scenario.gamemodes = appliedGamemodes
})

function deleteRole() {
	scenarioRoles.value.pop()
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
			<div class="z-10 flex gap-2">
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
				<OptionsButton name="Gamemodes" :icon="gamemodeMenuIcon" :slot-count="8" id="gamemode-menu">
					<ButtonOption
						name="Toggle Massacre gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/massacre.png'},
							{value: false, icon: 'images/icons/gamemodes/massacre.png'},
						]"
						v-model="gamemodes.Massacre"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Investigator gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/investigator.png'},
							{value: false, icon: 'images/icons/gamemodes/investigator.png'},
						]"
						v-model="gamemodes.Investigator"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Apocalypse gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/apocalypse.png'},
							{value: false, icon: 'images/icons/gamemodes/apocalypse.png'},
						]"
						v-model="gamemodes.Apocalypse"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Ritual gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/ritual.png'},
							{value: false, icon: 'images/icons/gamemodes/ritual.png'},
						]"
						v-model="gamemodes.Ritual"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Flashlight gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/flashlight.png'},
							{value: false, icon: 'images/icons/gamemodes/flashlight.png'},
						]"
						v-model="gamemodes.Flashlight"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Feast gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/feast.png'},
							{value: false, icon: 'images/icons/gamemodes/feast.png'},
						]"
						v-model="gamemodes.Feast"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Deathless gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/deathless.png'},
							{value: false, icon: 'images/icons/gamemodes/deathless.png'},
						]"
						v-model="gamemodes.Deathless"
						class="grow-0"
					/>
					<ButtonOption
						name="Toggle Afterlife gamemode"
						:options="[
							{value: true, icon: 'images/icons/gamemodes/afterlife.png'},
							{value: false, icon: 'images/icons/gamemodes/afterlife.png'},
						]"
						v-model="gamemodes.Afterlife"
						class="grow-0"
					/>
				</OptionsButton>
			</div>
			<input
				type="text"
				placeholder="No scenario name"
				autocomplete="off"
				v-model="settings.scenario.name"
				onclick="this.select() // Highlight text on click"
				name="scenario-name"
				id="scenario-name"
				class="placeholder:text-gray col-2 text-center text-3xl font-bold focus:outline-0"
			/>
			<ScenarioButtons ref="scenario-buttons" v-model="scenarioRoles" @button-clicked="emit" />
		</div>
		<Border class="grid min-h-47 grid-cols-1 grid-rows-1">
			<div
				v-show="scenarioRoles.length === 0"
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
					v-for="(roleData, index) in scenarioRoles"
					:key="roleData.id"
					:role-data="roleData"
					:index="index"
					v-model="scenarioRoles"
					:id="roleData.name"
				/>
			</div>
		</Border>
		<div class="mt-2 flex h-8 w-full justify-end gap-2">
			<div class="place-content-center text-right">
				<abbr
					v-if="scenarioRoles.length > MAX_ROLES"
					title="A max of 13 roles is recommended"
					class="decoration-red cursor-help underline-offset-4"
				>
					{{ scenarioRoles.length }} roles<span> (!)</span>
				</abbr>
				<span v-else>{{ scenarioRoles.length }} roles</span>
			</div>
			<IconButton
				name="Delete all roles"
				icon="images/icons/trash.png"
				@click="scenarioRoles.length = 0"
				class="grow-0"
			/>
		</div>
	</div>
</template>

<style>
#gamemode-menu {
	rotate: 90deg;
	& img {
		rotate: -90deg;
	}
}
</style>
