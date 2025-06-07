<script setup lang="ts">
import {inject, watch} from "vue"
import ButtonOption from "./ButtonOption.vue"
import IconButton from "./IconButton.vue"
import OptionsButton from "./OptionsButton.vue"
import roles, {type RoleData} from "../modules/roles.mts"
import settings from "../modules/settings.mts"
import generateRoleId from "../modules/functions/generateRoleId.mts"
import getRandomElement from "../modules/functions/getRandomElement.mts"
import randomizeRoles from "../modules/functions/randomizeRoles.mts"
import sortRoles from "../modules/functions/sortRoles.mts"

defineExpose({
	addRole,
})
const scenarioRoles = defineModel<RoleData[]>({required: true})
const shareModal = inject("shareModal") as {value: {show: () => void; close: () => void}}

function addRole() {
	if (settings.addRole.fillRequiredRoles) {
		// Killer/Massacre
		if (!scenarioRoles.value.find((role) => role.name === "Killer" || role.name === "Massacre")) {
			scenarioRoles.value.push({
				name: "Killer",
				alignment: "Murderous",
				isAlignmentRole: false,
				id: generateRoleId(),
			})
			return
		}
		// Private Eye/Hero
		if (!scenarioRoles.value.find((role) => role.name === "Private Eye" || role.name === "Hero")) {
			scenarioRoles.value.push({
				name: "Private Eye",
				alignment: "Dark Innocent",
				isAlignmentRole: false,
				id: generateRoleId(),
			})
			return
		}
		// Witness
		if (!scenarioRoles.value.find((role) => role.name === "Witness")) {
			scenarioRoles.value.push({
				name: "Witness",
				alignment: "Innocent",
				isAlignmentRole: false,
				id: generateRoleId(),
			})
			return
		}
	}

	if (settings.addRole.addedRole === "Bystander") {
		scenarioRoles.value.push({
			name: "Bystander",
			alignment: "Innocent",
			isAlignmentRole: false,
			id: generateRoleId(),
		})
	} else if (settings.addRole.addedRole === "Any role") {
		scenarioRoles.value.push({
			name: "Bystander",
			alignment: "Unknown",
			isAlignmentRole: true,
			id: generateRoleId(),
		})
	} else if (settings.addRole.addedRole === "Random role") {
		const role = getRandomElement(roles.roleList)
		const alignment = roles.roleAlignments[role]

		scenarioRoles.value.push({
			name: role,
			alignment: alignment,
			isAlignmentRole: false,
			id: generateRoleId(),
		})
	} else if (settings.addRole.addedRole === "Last role duplicate") {
		if (scenarioRoles.value.length === 0) {
			scenarioRoles.value.push({
				name: "Bystander",
				alignment: "Innocent",
				isAlignmentRole: false,
				id: generateRoleId(),
			})
			return
		}

		const lastRole = scenarioRoles.value[scenarioRoles.value.length - 1]
		scenarioRoles.value.push({
			name: lastRole.name,
			alignment: lastRole.alignment,
			isAlignmentRole: lastRole.isAlignmentRole,
			id: generateRoleId(),
		})
	} else {
		throw new Error(`Invalid value for addedRole: ${settings.addRole.addedRole}`)
	}
}

function randomizeAll() {
	randomizeRoles(scenarioRoles.value, scenarioRoles.value, settings.randomizeRoles)
}

function sortAll() {
	sortRoles(scenarioRoles.value, settings.sortRoles)
}

watch(
	[settings.sortRoles, scenarioRoles],
	([sortSettings]) => {
		if (sortSettings.autosortRoles) {
			sortAll()
		}
	},
	{
		deep: true,
	},
)

function openShareModal() {
	shareModal?.value?.show()
}
</script>

<template>
	<div class="flex flex-row-reverse gap-2">
		<IconButton name="Share" icon="../../images/icons/share.png" @click="openShareModal" />
		<OptionsButton name="Randomize all" icon="../images/icons/randomize.png" :slot-count="4" @click="randomizeAll">
			<ButtonOption
				:name="`Allow duplicates: ${settings.randomizeRoles.allowDuplicates}`"
				:options="[
					{value: true, icon: '../images/icons/duplicatesOn.png'},
					{value: false, icon: '../images/icons/duplicatesOff.png'},
				]"
				v-model="settings.randomizeRoles.allowDuplicates"
			/>
			<ButtonOption
				:name="`Maintain alignments: ${settings.randomizeRoles.maintainAlignments}`"
				:options="[
					{value: true, icon: '../images/icons/maintainAlignmentsOn.png'},
					{value: false, icon: '../images/icons/maintainAlignmentsOff.png'},
				]"
				v-model="settings.randomizeRoles.maintainAlignments"
			/>
			<ButtonOption
				:name="`Preserve required roles: ${settings.randomizeRoles.preserveRequiredRoles}`"
				:options="[
					{value: true, icon: '../images/icons/roleCheck.png'},
					{value: false, icon: '../images/icons/roleX.png'},
				]"
				v-model="settings.randomizeRoles.preserveRequiredRoles"
			/>
			<ButtonOption
				:name="`Allow replaceable super roles: ${settings.randomizeRoles.allowReplaceableSuperRoles}`"
				:options="[
					{value: true, icon: '../images/icons/allowSuperRoles.png'},
					{value: false, icon: '../images/icons/disallowSuperRoles.png'},
				]"
				v-model="settings.randomizeRoles.allowReplaceableSuperRoles"
			/>
		</OptionsButton>
		<OptionsButton name="Sort roles" icon="../images/icons/sort.png" :slot-count="4" @click="sortAll">
			<ButtonOption
				:name="`Autosort: ${settings.sortRoles.autosortRoles}`"
				:options="[
					{value: true, icon: '../images/icons/autosortOn.png'},
					{value: false, icon: '../images/icons/autosortOff.png'},
				]"
				v-model="settings.sortRoles.autosortRoles"
			/>
			<ButtonOption
				:name="`Sort by: ${settings.sortRoles.sortBy}`"
				:options="[
					{value: 'Alignment', icon: '../images/icons/sortAlignment.png'},
					{value: 'Lights out phase', icon: '../images/icons/sortLightsOut.png'},
					{value: 'Name', icon: '../images/icons/sortAlphabetical.png'},
				]"
				v-model="settings.sortRoles.sortBy"
			/>
			<ButtonOption
				:name="`Isolate required roles: ${settings.sortRoles.isolateRequiredRoles}`"
				:options="[
					{value: true, icon: '../images/icons/sortRoleCheck.png'},
					{value: false, icon: '../images/icons/sortRoleX.png'},
				]"
				v-model="settings.sortRoles.isolateRequiredRoles"
			/>
			<ButtonOption
				:name="`Prioritize super roles: ${settings.sortRoles.prioritizeSuperRoles}`"
				:options="[
					{value: true, icon: '../images/icons/sortSuperOn.png'},
					{value: false, icon: '../images/icons/sortSuperOff.png'},
				]"
				v-model="settings.sortRoles.prioritizeSuperRoles"
			/>
		</OptionsButton>
		<OptionsButton name="Add role" icon="../images/icons/add.png" :slot-count="2" @click="addRole">
			<ButtonOption
				:name="`Insert ${settings.addRole.addedRole}`"
				:options="[
					{value: 'Bystander', icon: '../images/icons/insertBystander.png'},
					{value: 'Any role', icon: '../images/icons/insertAnyRole.png'},
					{value: 'Random role', icon: '../images/icons/insertRandomRole.png'},
					{value: 'Last role duplicate', icon: '../images/icons/insertDuplicate.png'},
				]"
				v-model="settings.addRole.addedRole"
			/>
			<ButtonOption
				:name="`Fill required roles: ${settings.addRole.fillRequiredRoles}`"
				:options="[
					{value: true, icon: '../images/icons/roleCheck.png'},
					{value: false, icon: '../images/icons/roleX.png'},
				]"
				v-model="settings.addRole.fillRequiredRoles"
			/>
		</OptionsButton>
	</div>
</template>
