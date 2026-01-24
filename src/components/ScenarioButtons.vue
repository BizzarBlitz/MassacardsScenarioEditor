<script setup lang="ts">
import {inject, watch} from "vue"
import ButtonOption from "./ButtonOption.vue"
import IconButton from "./IconButton.vue"
import OptionsButton from "./OptionsButton.vue"
import roles, {type RoleData} from "../modules/roles.mts"
import settings from "../modules/settings.mts"
import getRandomElement from "../modules/functions/getRandomElement.mts"
import randomizeRoles from "../modules/functions/randomizeRoles.mts"
import sortRoles from "../modules/functions/sortRoles.mts"

defineExpose({
	addRole,
})
const scenarioRoles = defineModel<RoleData[]>({required: true})
const shareModal = inject("shareModal") as {show: () => void; hide: () => void}

function addRole() {
	if (settings.controls.addRole.fillRequiredRoles) {
		// Killer/Massacre
		if (!scenarioRoles.value.find((role) => role.name === "Killer" || role.name === "Massacre")) {
			scenarioRoles.value.push({
				name: "Killer",
				alignment: "Murderous",
				isAlignmentRole: false,
				optional: false,
				id: roles.generateRoleId(),
			})
			return
		}
		// Private Eye/Hero
		if (!scenarioRoles.value.find((role) => role.name === "Private Eye" || role.name === "Hero")) {
			scenarioRoles.value.push({
				name: "Private Eye",
				alignment: "Dark Innocent",
				isAlignmentRole: false,
				optional: false,
				id: roles.generateRoleId(),
			})
			return
		}
		// Witness
		if (!scenarioRoles.value.find((role) => role.name === "Witness")) {
			scenarioRoles.value.push({
				name: "Witness",
				alignment: "Innocent",
				isAlignmentRole: false,
				optional: false,
				id: roles.generateRoleId(),
			})
			return
		}
	}

	if (settings.controls.addRole.addedRole === "Bystander") {
		scenarioRoles.value.push({
			name: "Bystander",
			alignment: "Innocent",
			isAlignmentRole: false,
			optional: false,
			id: roles.generateRoleId(),
		})
	} else if (settings.controls.addRole.addedRole === "Any role") {
		scenarioRoles.value.push({
			name: "Bystander",
			alignment: "Unknown",
			isAlignmentRole: true,
			optional: false,
			id: roles.generateRoleId(),
		})
	} else if (settings.controls.addRole.addedRole === "Random role") {
		const role = getRandomElement(roles.roleList)
		const alignment = roles.roleAlignments[role]

		scenarioRoles.value.push({
			name: role,
			alignment: alignment,
			isAlignmentRole: false,
			optional: false,
			id: roles.generateRoleId(),
		})
	} else if (settings.controls.addRole.addedRole === "Last role duplicate") {
		if (scenarioRoles.value.length === 0) {
			scenarioRoles.value.push({
				name: "Bystander",
				alignment: "Innocent",
				optional: false,
				isAlignmentRole: false,
				id: roles.generateRoleId(),
			})
			return
		}

		const lastRole = scenarioRoles.value[scenarioRoles.value.length - 1]
		scenarioRoles.value.push({
			name: lastRole.name,
			alignment: lastRole.alignment,
			isAlignmentRole: lastRole.isAlignmentRole,
			optional: lastRole.isAlignmentRole,
			id: roles.generateRoleId(),
		})
	} else {
		throw new Error(`Invalid value for addedRole: ${settings.controls.addRole.addedRole}`)
	}
}

function randomizeAll() {
	randomizeRoles(scenarioRoles.value, scenarioRoles.value, settings.controls.randomizeRoles)
}

function sortAll() {
	sortRoles(scenarioRoles.value)
}

watch(
	[settings.controls.sortRoles, scenarioRoles],
	([sortSettings]) => {
		if (sortSettings.autosortRoles) {
			sortAll()
		}
	},
	{
		deep: true,
	},
)
</script>

<template>
	<div class="flex flex-row-reverse gap-2">
		<IconButton name="Share" icon="images/icons/share.png" @click="shareModal.show()" />
		<OptionsButton name="Randomize all" icon="images/icons/randomize.png" :slot-count="4" @click="randomizeAll">
			<ButtonOption
				:name="`Allow duplicates: ${settings.controls.randomizeRoles.allowDuplicates}`"
				:options="[
					{value: true, icon: 'images/icons/duplicatesOn.png'},
					{value: false, icon: 'images/icons/duplicatesOff.png'},
				]"
				v-model="settings.controls.randomizeRoles.allowDuplicates"
			/>
			<ButtonOption
				:name="`Maintain alignments: ${settings.controls.randomizeRoles.maintainAlignments}`"
				:options="[
					{value: true, icon: 'images/icons/maintainAlignmentsOn.png'},
					{value: false, icon: 'images/icons/maintainAlignmentsOff.png'},
				]"
				v-model="settings.controls.randomizeRoles.maintainAlignments"
			/>
			<ButtonOption
				:name="`Preserve required roles: ${settings.controls.randomizeRoles.preserveRequiredRoles}`"
				:options="[
					{value: true, icon: 'images/icons/roleCheck.png'},
					{value: false, icon: 'images/icons/roleX.png'},
				]"
				v-model="settings.controls.randomizeRoles.preserveRequiredRoles"
			/>
			<ButtonOption
				:name="`Allow replaceable super roles: ${settings.controls.randomizeRoles.allowReplaceableSuperRoles}`"
				:options="[
					{value: true, icon: 'images/icons/allowSuperRoles.png'},
					{value: false, icon: 'images/icons/disallowSuperRoles.png'},
				]"
				v-model="settings.controls.randomizeRoles.allowReplaceableSuperRoles"
			/>
		</OptionsButton>
		<OptionsButton name="Sort roles" icon="images/icons/sort.png" :slot-count="4" @click="sortAll">
			<ButtonOption
				:name="`Autosort: ${settings.controls.sortRoles.autosortRoles}`"
				:options="[
					{value: true, icon: 'images/icons/autosortOn.png'},
					{value: false, icon: 'images/icons/autosortOff.png'},
				]"
				v-model="settings.controls.sortRoles.autosortRoles"
			/>
			<ButtonOption
				:name="`Sort by: ${settings.controls.sortRoles.sortBy}`"
				:options="[
					{value: 'Alignment', icon: 'images/icons/sortAlignment.png'},
					{value: 'Lights out phase', icon: 'images/icons/sortLightsOut.png'},
					{value: 'Name', icon: 'images/icons/sortAlphabetical.png'},
				]"
				v-model="settings.controls.sortRoles.sortBy"
			/>
			<ButtonOption
				:name="`Isolate required roles: ${settings.controls.sortRoles.isolateRequiredRoles}`"
				:options="[
					{value: true, icon: 'images/icons/sortRoleCheck.png'},
					{value: false, icon: 'images/icons/sortRoleX.png'},
				]"
				v-model="settings.controls.sortRoles.isolateRequiredRoles"
			/>
			<ButtonOption
				:name="`Prioritize super roles: ${settings.controls.sortRoles.prioritizeSuperRoles}`"
				:options="[
					{value: true, icon: 'images/icons/sortSuperOn.png'},
					{value: false, icon: 'images/icons/sortSuperOff.png'},
				]"
				v-model="settings.controls.sortRoles.prioritizeSuperRoles"
			/>
		</OptionsButton>
		<OptionsButton name="Add role" icon="images/icons/add.png" :slot-count="2" @click="addRole">
			<ButtonOption
				:name="`Insert ${settings.controls.addRole.addedRole}`"
				:options="[
					{value: 'Bystander', icon: 'images/icons/insertBystander.png'},
					{value: 'Any role', icon: 'images/icons/insertAnyRole.png'},
					{value: 'Random role', icon: 'images/icons/insertRandomRole.png'},
					{value: 'Last role duplicate', icon: 'images/icons/insertDuplicate.png'},
				]"
				v-model="settings.controls.addRole.addedRole"
			/>
			<ButtonOption
				:name="`Fill required roles: ${settings.controls.addRole.fillRequiredRoles}`"
				:options="[
					{value: true, icon: 'images/icons/roleCheck.png'},
					{value: false, icon: 'images/icons/roleX.png'},
				]"
				v-model="settings.controls.addRole.fillRequiredRoles"
			/>
		</OptionsButton>
	</div>
</template>
