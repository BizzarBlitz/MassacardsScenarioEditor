<script setup lang="ts">
import {provide, useTemplateRef} from "vue"
import Scenario from "./components/Scenario.vue"
import Topbar from "./components/Topbar.vue"
import ShareModal from "./components/ShareModal.vue"

const scenario = useTemplateRef("scenario")
const shareModal = useTemplateRef("share-modal")

provide("shareModal", shareModal)
</script>

<template>
	<Topbar />
	<ShareModal :roles="scenario?.roles || []" :scenario-name="scenario?.name || ''" ref="share-modal" />
	<main>
		<div id="subtitle" class="justify-center pt-1 text-center text-xl font-bold">
			A tool for quickly editing
			<a
				href="https://massacremansionoff.wixsite.com/massacards"
				class="text-red underline transition-colors hover:text-white focus-visible:text-white"
				>Massacards</a
			>
			role combinations<br />
			Developed by
			<a
				href="https://github.com/BizzarBlitz"
				class="text-red underline transition-colors hover:text-white focus-visible:text-white"
				>BizzarBlitz</a
			>
		</div>
		<Scenario ref="scenario" />
	</main>
</template>
