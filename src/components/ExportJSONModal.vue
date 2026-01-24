<script setup lang="ts">
import {computed, ref, useTemplateRef} from "vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import roles from "../modules/roles.mts"
import settings from "../modules/settings.mts"
import type {Alignment, RoleData} from "../modules/roles.mts"

const JSON_DATA_URI_PREFIX = "data:text/json;charset=utf-8,"

const modal = useTemplateRef("json-modal")
defineExpose({
	show: () => {
		modal.value?.show()
	},
	hide: () => {
		modal.value?.hide()
	},
})

const props = defineProps<{
	roles: RoleData[]
}>()

export type ScenarioJSON = {
	name: string
	roles: string[]
	gamemodes: string[]
	guestNumberCards?: boolean
} & ExtraDataJSON

export type ExtraDataJSON = {
	customRoles: {
		name: string
		alignment: Alignment
		link: string
		icon: string
	}[]
}

const exportRequiredJSONIcon = ref("images/icons/json.png")
const exportFullJSONIcon = ref("images/icons/json.png")

const requiredJSON = computed(() => {
	return JSON.stringify(requiredJSONData.value)
})
const requiredJSONData = computed(() => {
	const output: ExtraDataJSON = {
		customRoles: [],
	}

	props.roles.forEach((role) => {
		if (roles.isCustomRole(role.name)) {
			const customRole = roles.getCustomRole(role.name)!
			output.customRoles.push({
				name: customRole.name,
				alignment: customRole.alignment,
				link: customRole.link,
				icon: customRole.icon.startsWith("blob:") ? "" : customRole.icon,
			})
		}
	})

	return output
})

const fullJSON = computed(() => {
	return JSON.stringify(fullJSONData.value)
})
const fullJSONData = computed(() => {
	const roleNames: string[] = []
	props.roles.forEach((role, index) => {
		roleNames[index] = role.name
	})

	const output: ScenarioJSON = Object.assign(
		{
			name: settings.scenario.name,
			roles: roleNames,
			gamemodes: settings.scenario.gamemodes,
			guestNumberCards: settings.scenario.guestNumberCards,
		},
		requiredJSONData.value,
	)

	return output
})
</script>

<template>
	<Modal ref="json-modal">
		<div class="grid max-h-full grid-cols-2 grid-rows-1 justify-between gap-4">
			<div class="flex flex-col gap-2">
				<a
					:href="JSON_DATA_URI_PREFIX + encodeURIComponent(requiredJSON)"
					:download="`${settings.scenario.name}.json`"
					class="self-center"
					><TextIconButton name="Download required JSON" :icon="exportRequiredJSONIcon"
				/></a>
				<textarea
					name="text-preview"
					id="text-preview"
					readonly="true"
					placeholder="No JSON required"
					class="border-gray mb-2 field-sizing-content w-full grow resize-none border-1 px-1"
					>{{ JSON.stringify(requiredJSONData, null, 4) }}</textarea
				>
			</div>
			<div class="flex flex-col gap-2">
				<a
					:href="JSON_DATA_URI_PREFIX + encodeURIComponent(fullJSON)"
					:download="`${settings.scenario.name}.json`"
					class="self-center"
					><TextIconButton name="Download complete JSON" :icon="exportFullJSONIcon"
				/></a>
				<textarea
					name="text-preview"
					id="text-preview"
					readonly="true"
					class="border-gray mb-2 field-sizing-content w-full grow resize-none border-1 px-1"
					>{{ JSON.stringify(fullJSONData, null, 4) }}</textarea
				>
			</div>
		</div>
	</Modal>
</template>
