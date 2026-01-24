<script setup lang="ts">
import {computed, toRef, useTemplateRef} from "vue"
import IconButton from "./IconButton.vue"
import type {Alignment} from "../modules/roles.mts"
import Autocomplete from "./Autocomplete.vue"
import alignments from "../modules/alignments.json"

const customRoles = defineModel<CustomRole[]>({
	required: true,
})

const props = defineProps<{
	customRole: CustomRole
	index: number
}>()
const customRole = toRef(props.customRole)

export type CustomRole = {
	name: string
	alignment: Alignment
	icon: string
	link: string
	id: number
}

const iconInput = useTemplateRef("icon-input")

const editLinkIcon = computed(() => {
	return customRole.value.link !== "" ? "images/icons/link.png" : "images/icons/noLink.png"
})

function onAlignmentChanged(newAlignment: string, isValid: boolean) {
	if (!isValid) return
	customRole.value.alignment = newAlignment as Alignment
}

function deleteCustomRole() {
	customRoles.value.splice(props.index, 1)
}

function onIconChanged() {
	if (!iconInput.value || !iconInput.value.files) return

	const file = iconInput.value.files[0] || "images/roles/Placeholder.png"
	customRole.value.icon = URL.createObjectURL(file)
}
</script>

<template>
	<div class="flex w-full flex-col gap-1">
		<div class="flex h-16 gap-3">
			<div class="grid aspect-square h-full w-16 cursor-pointer grid-cols-1 grid-rows-1">
				<input
					type="file"
					name="custom-role-icon"
					accept="image/*"
					title="Click to change icon"
					@change="onIconChanged"
					ref="icon-input"
					:id="`icon-input-${customRole.id}`"
					class="peer col-start-1 col-end-1 row-start-1 row-end-1 h-full cursor-pointer opacity-0 file:cursor-pointer"
				/>
				<label
					:for="`icon-input-${customRole.id}`"
					class="-z-10 col-start-1 col-end-1 row-start-1 row-end-1 peer-hover:opacity-50"
				>
					<img
						:src="customRole.icon"
						draggable="false"
						class="h-full w-full hover:opacity-50"
						style="image-rendering: pixelated"
					/>
				</label>
			</div>
			<input
				type="text"
				spellcheck="false"
				autocomplete="off"
				placeholder="No name"
				v-model="customRole.name"
				ref="name-input"
				class="h-full w-full text-2xl font-semibold"
			/>
			<IconButton name="Delete custom role" icon="images/icons/trash.png" @click="deleteCustomRole" class="w-8" />
		</div>
		<div class="flex h-8 gap-2">
			<img
				:src="`images/alignments/${customRole.alignment}.png`"
				:alt="`${customRole.alignment} alignment icon`"
				draggable="false"
				class="h-full grow-0"
				style="image-rendering: pixelated"
			/>
			<Autocomplete
				:options="alignments"
				autocomplete="off"
				placeholder="No alignment"
				onclick="this.select()"
				@input-string-changed="onAlignmentChanged"
				:value="customRole.alignment"
				v-model="customRole.alignment"
				ref="alignment-input"
				class="w-full text-left text-lg text-nowrap"
			/>
		</div>
		<div class="flex h-8 gap-2">
			<img
				:src="editLinkIcon"
				:alt="editLinkIcon === 'images/icons/link.png' ? 'Link' : 'No link'"
				draggable="false"
				class="h-full grow-0"
				style="image-rendering: pixelated"
			/>
			<input
				type="text"
				spellcheck="false"
				autocomplete="off"
				placeholder="No link"
				v-model="customRole.link"
				ref="link-input"
				class="h-full w-full text-base"
			/>
		</div>
	</div>
</template>
