<script setup lang="ts">
import {toRaw, useTemplateRef} from "vue"
import ConfigSection from "./ConfigSection.vue"
import CustomRoleItem from "./CustomRoleItem.vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import settings from "../modules/settings.mts"
import roles from "../modules/roles.mts"
import ImportImageModal from "./ImportImageModal.vue"

const modal = useTemplateRef("config-modal")
const importImageModal = useTemplateRef("import-image-modal")

defineExpose({
	show: () => {
		modal.value?.show()
	},
	hide: () => {
		modal.value?.hide()
	},
})

function addCustomRole() {
	settings.userSettings.customRoles.push({
		name: "",
		alignment: "Unknown",
		icon: "images/roles/Placeholder.png",
		link: "",
		id: roles.generateRoleId(),
	})
}
</script>

<template>
	<ImportImageModal ref="import-image-modal" />
	<Modal ref="config-modal" class="min-w-150">
		<ConfigSection name="Custom roles" class="flex h-full flex-col">
			<ul class="space-y-4 overflow-auto">
				<li v-for="(customRole, index) in settings.userSettings.customRoles">
					<CustomRoleItem
						:index
						:key="customRole.id"
						:custom-role
						:import-image-modal="toRaw(importImageModal)"
						v-model="settings.userSettings.customRoles"
					/>
				</li>
			</ul>
			<TextIconButton name="Add custom role" icon="images/icons/add.png" @click="addCustomRole" class="mx-auto mt-4" />
		</ConfigSection>
	</Modal>
</template>
