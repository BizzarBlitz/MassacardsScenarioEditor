<script setup lang="ts">
import {provide, useTemplateRef} from "vue"
import ConfigModal from "./components/ConfigModal.vue"
import Scenario from "./components/Scenario.vue"
import ShareModal from "./components/ShareModal.vue"
import Topbar from "./components/Topbar.vue"

const shareModal = useTemplateRef("share-modal")
const configModal = useTemplateRef("config-modal")

provide("shareModal", shareModal)
provide("configModal", configModal)
</script>

<template>
	<Topbar />
	<ShareModal ref="share-modal" />
	<ConfigModal ref="config-modal" />
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
		<Scenario />
	</main>
</template>
