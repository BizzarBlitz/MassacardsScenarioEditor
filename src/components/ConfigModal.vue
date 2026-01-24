<script setup lang="ts">
import {useTemplateRef} from "vue"
import ConfigSection from "./ConfigSection.vue"
import CustomRoleItem from "./CustomRoleItem.vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import settings from "../modules/settings.mts"
import roles from "../modules/roles.mts"

const modal = useTemplateRef("config-modal")

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
	<Modal ref="config-modal" class="min-w-150">
		<ConfigSection name="Custom roles" class="flex h-full flex-col">
			<ul class="space-y-4 overflow-auto">
				<li v-for="(customRole, index) in settings.userSettings.customRoles">
					<CustomRoleItem :index :key="customRole.id" :custom-role v-model="settings.userSettings.customRoles" />
				</li>
			</ul>
			<TextIconButton name="Add custom role" icon="images/icons/add.png" @click="addCustomRole" class="mx-auto mt-4" />
		</ConfigSection>
	</Modal>
</template>
