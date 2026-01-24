<script setup lang="ts">
import {inject, useTemplateRef} from "vue"
import IconButton from "./IconButton.vue"
import DeleteDataModal from "./DeleteDataModal.vue"
import ImportJSONModal from "./ImportJSONModal.vue"

const configModal = inject("configModal") as {show: () => void; close: () => void}
const deleteDataModal = useTemplateRef("delete-data-modal")
const importJSONModal = useTemplateRef("import-json-modal")
</script>

<template>
	<DeleteDataModal ref="delete-data-modal" />
	<ImportJSONModal ref="import-json-modal" />
	<header>
		<h1 class="absolute left-1/2 h-18 -translate-x-1/2 content-center text-5xl font-bold">Massacards Scenario Editor</h1>
		<div class="bg-red p-1">
			<nav class="align-end flex h-16 w-full place-content-between gap-2">
				<!-- Idk if I have to like legally implement this but I'm kinda lazy so it's hidden for now -->
				<IconButton
					name="Delete browser data"
					icon="images/icons/deleteData.png"
					@click="deleteDataModal?.show()"
					class="hidden h-full grow-0 invert"
				/>
				<IconButton
					name="Settings"
					icon="images/icons/settings.png"
					@click="configModal.show()"
					class="h-full grow-0 invert"
				/>
				<IconButton
					name="Import JSON"
					icon="images/icons/import.png"
					@click="importJSONModal?.show()"
					class="mr-auto h-full grow-0 invert"
				/>
				<a href="https://github.com/BizzarBlitz/MassacardsScenarioEditor" target="_blank">
					<IconButton name="GitHub" icon="images/icons/github.png" class="h-full grow-0 invert" />
				</a>
			</nav>
		</div>
	</header>
</template>
