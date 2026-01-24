<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import settings from "../modules/settings.mts"
import Ajv from "ajv/dist/jtd"
import scenarioRoles from "../modules/scenarioRoles.mts"
import roles from "../modules/roles.mts"
import * as urlManager from "../modules/urlManager.mts"
import type {ScenarioJSON} from "./ExportJSONModal.vue"

const modal = useTemplateRef("import-json-modal")
defineExpose({
	show: () => {
		modal.value?.show()
	},
	hide: () => {
		modal.value?.hide()
	},
})

const jsonFileInput = useTemplateRef("json-file-input")
const pastedJSON = ref("")

const isValidJSON = new Ajv().compile({
	optionalProperties: {
		name: {type: "string"},
		roles: {elements: {type: "string"}},
		gamemodes: {elements: {type: "string"}},
		guestNumberCards: {type: "boolean"},
		customRoles: {
			elements: {
				properties: {
					name: {type: "string"},
					alignment: {enum: roles.alignmentList},
					link: {type: "string"},
					icon: {type: "string"},
				},
			},
		},
	},
})

function applyJSONData(importedData: ScenarioJSON) {
	if ("customRoles" in importedData) {
		importedData.customRoles.forEach((customRole) => {
			settings.userSettings.customRoles.push({
				name: customRole.name,
				alignment: customRole.alignment,
				link: customRole.link,
				icon: customRole.icon,
				id: roles.generateRoleId(),
			})
		})
	}

	if ("name" in importedData) {
		settings.scenario.name = importedData.name
	}
	if ("gamemodes" in importedData) {
		settings.scenario.gamemodes = importedData.gamemodes
	}
	if ("guestNumberCards" in importedData) {
		settings.scenario.guestNumberCards = importedData.guestNumberCards
	}
	if ("roles" in importedData) {
		scenarioRoles.value = urlManager.generateRolesFromNames(importedData.roles)
		console.log("changed roles:", scenarioRoles.value)
	}
}

function useJSON(json: string) {
	try {
		const importedData: ScenarioJSON = JSON.parse(json)
		if (isValidJSON(importedData)) {
			applyJSONData(importedData)
		} else {
			console.warn("Invalid imported JSON:", importedData)
		}
	} catch (error) {
		console.error("Error parsing imported JSON:", error)
	}
}

async function useImportedJSON() {
	if (!jsonFileInput.value || !jsonFileInput.value.files) return

	const file = jsonFileInput.value.files[0] || "{}"
	useJSON(await file.text())

	modal.value?.hide()
}

function usePastedJSON() {
	useJSON(pastedJSON.value)
	modal.value?.hide
}

function onModalClosed() {
	pastedJSON.value = ""
}
</script>

<template>
	<Modal ref="import-json-modal" @closed="onModalClosed">
		<div class="flex max-h-full min-w-[25vw] flex-col gap-4">
			<div class="grid grid-cols-1 grid-rows-1 place-items-center">
				<input
					type="file"
					name="json-file-import"
					accept="application/json"
					@change="useImportedJSON"
					v-show="pastedJSON === ''"
					ref="json-file-input"
					class="peer z-10 col-start-1 col-end-1 row-start-1 row-end-1 h-full w-full text-xs opacity-0 file:h-full file:w-full file:cursor-pointer"
				/>
				<label for="json-file-import" class="col-start-1 col-end-1 row-start-1 row-end-1 peer-hover:opacity-60">
					<TextIconButton
						:name="pastedJSON === '' ? 'Import JSON file' : 'Apply pasted JSON'"
						icon="images/icons/json.png"
						@click="usePastedJSON"
					/>
				</label>
			</div>
			<span class="text-2xl font-semibold">OR</span>
			<textarea
				id="json-text-import"
				placeholder="Paste JSON here"
				v-model="pastedJSON"
				class="border-gray field-sizing-content min-h-42 resize-none border px-1"
			/>
		</div>
	</Modal>
</template>
