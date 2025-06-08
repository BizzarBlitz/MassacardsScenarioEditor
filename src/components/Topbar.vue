<script setup lang="ts">
import IconButton from "./IconButton.vue"
</script>

<template>
	<header>
		<h1 class="absolute left-1/2 h-16 -translate-x-1/2 content-center text-5xl font-bold">Massacards Scenario Editor</h1>
		<nav class="bg-red align-end flex h-16 w-full place-content-center justify-end p-1">
			<!-- <IconButton name="Clear cookies" icon="images/icons/clearCookies.png" class="h-full grow-0 invert" /> not doing allat -->
			<a href="https://github.com/BizzarBlitz/MassacardsScenarioEditor" target="_blank">
				<IconButton name="GitHub" icon="images/icons/github.png" class="h-full grow-0 invert" />
			</a>
		</nav>
	</header>
</template>
