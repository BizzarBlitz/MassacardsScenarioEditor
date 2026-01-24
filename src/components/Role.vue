<script setup lang="ts">
import {computed} from "vue"
import Autocomplete from "./Autocomplete.vue"
import IconButton from "./IconButton.vue"
import roles, {type Alignment, type RoleData} from "../modules/roles.mts"
import settings from "../modules/settings.mts"
import alignments from "../modules/alignments.json"
import randomizeRoles from "../modules/functions/randomizeRoles.mts"
import ButtonOption from "./ButtonOption.vue"

const props = defineProps<{
	roleData: RoleData
	index: number
}>()

const scenarioRoles = defineModel<RoleData[]>({
	required: true,
})

const roleName = computed(() =>
	props.roleData.isAlignmentRole
		? `Any ${props.roleData.alignment === "Unknown" ? "Role" : props.roleData.alignment}`
		: props.roleData.name,
)
const alignmentName = computed(() => props.roleData.alignment)
const roleLink = computed(() => {
	if (props.roleData.isAlignmentRole) {
		return `https://massacards.miraheze.org/wiki/${props.roleData.alignment}_Alignment`
	} else {
		return roles.getRoleLink(props.roleData.name)
	}
})
const roleIconSrc = computed(() => {
	if (props.roleData.isAlignmentRole) {
		return `images/alignments/${props.roleData.alignment}.png`
	} else {
		return roles.getRoleIcon(props.roleData.name)
	}
})

function onRoleNameChanged(newRoleName: string, isValid: boolean) {
	if (!isValid) return

	props.roleData.name = newRoleName
	props.roleData.alignment = roles.getRoleAlignment(newRoleName)
	props.roleData.isAlignmentRole = false
}

function onRoleAlignmentChanged(newAlignment: string, isValid: boolean) {
	if (!isValid) return

	props.roleData.alignment = newAlignment as Alignment
}

function deleteRole(event: Event) {
	scenarioRoles.value.splice(props.index, 1)
	event.stopPropagation()
	event.preventDefault() // Prevent middle click scroll toggle
}

function duplicateRole(event: Event) {
	scenarioRoles.value.splice(props.index + 1, 0, {
		name: props.roleData.name,
		alignment: props.roleData.alignment,
		isAlignmentRole: props.roleData.isAlignmentRole,
		optional: props.roleData.optional,
		id: roles.generateRoleId(),
	})

	event.stopPropagation()
}

function randomizeRole() {
	randomizeRoles([props.roleData], scenarioRoles.value, {
		allowDuplicates: settings.controls.randomizeRoles.allowDuplicates,
		maintainAlignments: settings.controls.randomizeRoles.maintainAlignments,
		preserveRequiredRoles: false, // If this is a required role we still want to randomize it regardless
		allowReplaceableSuperRoles: settings.controls.randomizeRoles.allowReplaceableSuperRoles,
	})
}

function onAlignmentClicked() {
	props.roleData.isAlignmentRole = !props.roleData.isAlignmentRole
}
</script>

<template>
	<div @click="$event.stopPropagation()" @click.middle="deleteRole" class="w-41 place-items-center">
		<Autocomplete
			:options="roles.completeRoleList.value"
			@input-string-changed="onRoleNameChanged"
			autocomplete="off"
			placeholder="No role name"
			onclick="this.select()"
			:value="roleName"
			v-model="roleName"
			class="placeholder:text-gray w-full text-center font-bold"
		/>
		<div class="role-settings-container group grid grid-cols-[1.125rem_1fr_1.125rem_1.125rem] grid-rows-1">
			<div class="col-[1_/_span_2] ml-4.5 aspect-square w-full transition-[margin] duration-100 group-hover:ml-0">
				<div class="role-icon-container grid cursor-move grid-cols-1 grid-rows-1">
					<img
						:src="roleIconSrc"
						:alt="`${roleData.name} role icon`"
						class="col-1 row-1 h-full w-full"
						style="image-rendering: pixelated"
					/>
					<div
						class="col-1 row-1 p-1 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
						:class="{'opacity-100': roleData.optional}"
					>
						<ButtonOption
							:name="`Optional: ${roleData.optional}`"
							:options="[
								{value: false, icon: 'images/alignments/Unknown.png'},
								{value: true, icon: 'images/alignments/Unknown.png'},
							]"
							v-model="roleData.optional"
							class="h-8 bg-black"
						/>
					</div>
				</div>
				<div class="mt-1 flex w-32 max-w-40 gap-1">
					<IconButton
						:name="roleData.isAlignmentRole ? 'Make normal role' : 'Make alignment role'"
						:icon="`images/alignments/${roleData.alignment}.png`"
						@click="onAlignmentClicked"
						class="h-8"
					/>
					<Autocomplete
						:options="alignments"
						@input-string-changed="onRoleAlignmentChanged"
						autocomplete="off"
						placeholder="No alignment"
						onclick="this.select()"
						:value="alignmentName"
						v-model="alignmentName"
						class="text-sm font-semibold"
					/>
				</div>
			</div>

			<div
				class="role-controls col-[3_/_span_2] flex flex-col justify-between pl-1 opacity-0 transition-[clip-path,_opacity] duration-100 group-hover:opacity-100"
			>
				<IconButton name="Delete" icon="images/icons/close.png" @click="deleteRole" />
				<IconButton name="Duplicate" icon="images/icons/duplicate.png" @click="duplicateRole" />
				<IconButton name="Randomize" icon="images/icons/randomize.png" @click="randomizeRole" />
				<a :href="roleLink" target="_blank" class="contents">
					<IconButton
						:name="
							roles.isCustomRole(roleData.name)
								? roleLink === ''
									? 'No role information'
									: 'View role information (external link)'
								: 'View wiki entry'
						"
						:icon="
							roles.isCustomRole(roleData.name)
								? roleLink === ''
									? 'images/icons/noLink.png'
									: 'images/icons/link.png'
								: 'images/icons/wiki.png'
						"
						@mousedown="$event.stopPropagation()"
					/>
				</a>
			</div>
		</div>
	</div>
</template>

<style scoped>
.role-controls {
	clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

.role-settings-container:hover .role-controls,
.role-controls *:focus {
	clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.sortable-ghost {
	opacity: 0.75;
}

.sortable-drag {
	opacity: 0;
	cursor: move;
}
</style>
