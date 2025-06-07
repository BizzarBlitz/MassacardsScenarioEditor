<script setup lang="ts">
const borderScaleFactor = 5

defineProps<{
	background?: string
}>()

defineOptions({
	inheritAttrs: false,
})
</script>

<template>
	<div id="border-container" class="grid">
		<div
			id="border"
			class="-z-10 col-start-1 col-end-1 row-start-1 row-end-1"
			:style="`
				--border-scale-factor: ${borderScaleFactor};
				border-style: solid;
				border-width: calc(9px * var(--border-scale-factor)) calc(20px * var(--border-scale-factor))
					calc(3px * var(--border-scale-factor)) calc(3px * var(--border-scale-factor));
				border-image-source: url(&quot;https://static.miraheze.org/massacardswiki/4/46/Border.png&quot;);
				border-image-slice: 144 320 48 48;`"
		></div>
		<div
			v-if="background"
			id="background"
			:style="`background: ${background}; margin: calc(2px * ${borderScaleFactor})`"
			class="-z-20 col-start-1 col-end-1 row-start-1 row-end-1"
		></div>
		<div
			v-bind="$attrs"
			id="border-content"
			class="col-start-1 col-end-1 row-start-1 row-end-1 border-solid border-transparent p-2"
			:style="`border-width: calc(2px * ${borderScaleFactor});`"
		>
			<slot />
		</div>
	</div>
</template>

<!-- <style scoped>
.border {
	--border-scale-factor: 5;
	border-style: solid;
	border-width: calc(9px * var(--border-scale-factor)) calc(20px * var(--border-scale-factor))
		calc(3px * var(--border-scale-factor)) calc(3px * var(--border-scale-factor));
	border-image-source: url("https://static.miraheze.org/massacardswiki/4/46/Border.png");
	border-image-slice: 144 320 48 48;
}
</style> -->
