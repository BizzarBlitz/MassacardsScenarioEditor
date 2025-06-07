<script setup lang="ts">
import {ref, watch, type Ref} from "vue"

defineOptions({
	inheritAttrs: false,
})
const props = defineProps<{
	options: string[]
	value: string
}>()
const emit = defineEmits<{
	inputStringChanged: [newInput: string, isValid: boolean]
	// [TODO]: Possibly 'autocompleteStringChanged: string | null'?
}>()
const value = defineModel<string>({required: true})

// Sort from shortest to longest to prevent overrides (Hostage and Host for example)
const autocompleteOptions = props.options.toSorted((a, b) => {
	return a.length - b.length
})

const inputString = ref(props.value || "") as Ref<string>

const autocompletedPortion = ref("")
const isFocused = ref(false)
const isTextSelected = ref(false)
const showAutocomplete = ref(false)

watch([isFocused, isTextSelected, autocompletedPortion], ([newIsFocused, newIsTextSelected, newAutocompletedPortion]) => {
	showAutocomplete.value = newIsFocused && !newIsTextSelected && newAutocompletedPortion !== ""
})

watch(inputString, (newString) => {
	isTextSelected.value = false

	if (newString === "") {
		autocompletedPortion.value = ""
		emit("inputStringChanged", newString, false)
		return
	}

	const [autocompletedString, isCompleteString] = findBestAutocompleteOption(autocompleteOptions, inputString.value)

	if (inputString.value.toLowerCase() === autocompletedString?.toLowerCase()) {
		inputString.value = autocompletedString
	}

	if (autocompletedString) {
		const remainingName = autocompletedString.slice(inputString.value.length)
		autocompletedPortion.value = remainingName
	} else {
		autocompletedPortion.value = ""
	}

	emit("inputStringChanged", newString, isCompleteString)
})

watch(value, (newValue) => {
	inputString.value = newValue
})

function findBestAutocompleteOption(array: string[], string: string): [string, boolean] | [undefined, false] {
	for (const completeString of array) {
		if (string === completeString) {
			return [completeString, true]
		}

		const beginningString = completeString.slice(0, string.length)
		if (beginningString.toLowerCase() === string.toLowerCase()) return [completeString, false]
	}

	return [undefined, false]
}

// Prevent real input selection visual from conflicting with fake input visual
function checkSelection(event: Event /* Technically InputEvent but TS gets mad */) {
	const inputElement = event.target as HTMLInputElement
	isTextSelected.value = inputElement.selectionStart !== inputElement.selectionEnd
}

function fillAutocomplete() {
	inputString.value += autocompletedPortion.value
}

function onEnterPressed() {
	if (showAutocomplete) {
		fillAutocomplete()
	}
}
</script>

<template>
	<div class="grid grid-cols-1 grid-rows-1" v-bind="$attrs" onclick="">
		<input
			ref="autocomplete-input"
			type="text"
			spellcheck="false"
			v-bind="$attrs"
			v-model="inputString"
			@focusin="isFocused = true"
			@focusout="isFocused = false"
			@select="checkSelection"
			@keydown.enter="onEnterPressed"
			class="selection:bg-red z-10 col-start-1 col-end-2 row-start-1 row-end-2 caret-white selection:text-white"
			:style="showAutocomplete ? 'color: transparent; caret-color: transparent;' : undefined"
		/>
		<div class="-z-10 col-span-1 col-start-1 row-span-1 row-start-1 place-content-center">
			<span v-show="showAutocomplete">{{ inputString }}</span>
			<span ref="autocomplete-remainder" v-show="showAutocomplete" class="text-gray">{{ autocompletedPortion }}</span>
		</div>
	</div>
</template>
