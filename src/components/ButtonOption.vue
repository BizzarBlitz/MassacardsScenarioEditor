<script setup lang="ts">
import {computed} from "vue"
import IconButton from "./IconButton.vue"

export type ConfigOption = {
	value: unknown
	icon: string
}

const props = defineProps<{
	name: string
	options: ConfigOption[]
}>()

const value = defineModel<unknown>({required: true})
const icon = computed(() => {
	return props.options.find((option) => option.value === value.value)!.icon
})

function onClick() {
	const index = props.options.findIndex((option) => option.value === value.value)
	const selectedOption = props.options[(index + 1) % props.options.length]

	value.value = selectedOption.value
}
</script>

<template>
	<IconButton
		:name
		:icon="icon"
		@click="onClick"
		:style="{opacity: typeof value === 'boolean' && value === false && options.length === 2 ? 0.25 : undefined}"
	/>
</template>
