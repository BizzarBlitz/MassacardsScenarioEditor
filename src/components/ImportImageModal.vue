<script setup lang="ts">
import {ref, useTemplateRef} from "vue"
import Modal from "./Modal.vue"
import TextIconButton from "./TextIconButton.vue"
import IconButton from "./IconButton.vue"

// If value is empty string (e.g. user clicked close button or submitted empty/placeholder value), then image remains unchanged
let imagePromise: Promise<string> = new Promise((resolve) => resolve(""))
let resolveImagePromise: (value: string | PromiseLike<string>) => void

const modal = useTemplateRef("import-image-modal")
defineExpose({
	show: () => {
		imagePromise = new Promise((resolve) => {
			resolveImagePromise = resolve
		})
		modal.value?.show()
		return imagePromise
	},
	hide: hideModal,
})

function hideModal(iconValue?: string) {
	resolveImagePromise(iconValue || "")
	localImage.value = "images/roles/Placeholder.png"
	imageLink.value = ""
	modal.value?.hide()
}

const localImage = ref("images/roles/Placeholder.png")
const localImageInput = useTemplateRef("local-image-input")
function onLocalImageChanged() {
	if (!localImageInput.value?.files) return

	const file = localImageInput.value.files[0] || "images/roles/Placeholder.png"
	localImage.value = URL.createObjectURL(file)
}

function resetLocalImage() {
	localImage.value = "images/roles/Placeholder.png"
}

function useLocalImage() {
	hideModal(localImage.value)
}

const imageLink = ref("")
function useImageLink() {
	hideModal(imageLink.value || "images/roles/Placeholder.png")
}
</script>

<template>
	<Modal ref="import-image-modal">
		<div class="flex flex-col gap-4">
			<div>
				<div class="flex flex-row items-stretch justify-items-center gap-2">
					<div class="flex flex-col gap-1">
						<img
							:src="localImage || 'images/roles/Placeholder.png'"
							draggable="false"
							class="aspect-square h-32 w-32"
							style="image-rendering: pixelated"
						/>
						<div class="flex h-8 flex-row justify-between gap-2">
							<IconButton
								name="Clear"
								icon="images/icons/close.png"
								@click="resetLocalImage"
								class="h-full grow-0"
							/>
							<IconButton
								name="Use image"
								icon="images/icons/check.png"
								@click="useLocalImage"
								class="h-full grow-0"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div class="grid cursor-pointer grid-cols-1 grid-rows-1">
							<input
								type="file"
								name="local-image-upload"
								accept="image/*"
								@change="onLocalImageChanged"
								ref="local-image-input"
								class="peer col-start-1 col-end-1 row-start-1 row-end-1 h-full cursor-pointer opacity-0 file:cursor-pointer"
							/>
							<label
								for="local-image-upload"
								class="-z-10 col-start-1 col-end-1 row-start-1 row-end-1 peer-hover:opacity-60"
							>
								<TextIconButton
									name="Browse local images"
									icon="images/icons/imageFile.png"
									class="w-full justify-start"
								/>
							</label>
						</div>
						<span class="max-w-full text-left text-sm text-[gold]">
							Local images don't save<br />between page refreshes<br />and cannot be shared
						</span>
					</div>
				</div>
			</div>
			<span class="text-2xl font-semibold">OR</span>
			<div class="grid grid-cols-[1fr_128px] grid-rows-1 justify-end gap-2">
				<div class="col-start-1 flex h-full flex-col">
					<textarea
						type="text"
						name="image-link"
						ref="image-link-input"
						placeholder="Paste link to image"
						v-model.lazy.trim="imageLink"
						@keydown.enter.prevent="imageLink = ($event.target as HTMLTextAreaElement)?.value"
						class="border-gray w-full grow resize-none self-start border px-1"
					/>
					<span
						v-if="
							imageLink.startsWith('https://media.discordapp.net') ||
							imageLink.startsWith('https://cdn.discordapp.com')
						"
						class="text-sm text-[gold]"
						>Discord image links expire after 24 hours</span
					>
				</div>
				<div class="flex flex-col gap-1">
					<img
						:src="imageLink || 'images/roles/Placeholder.png'"
						alt=""
						draggable="false"
						class="aspect-square h-32 w-32"
						style="image-rendering: pixelated"
					/>
					<div class="flex h-8 flex-row justify-between gap-2">
						<IconButton
							name="Clear"
							icon="images/icons/close.png"
							@click="imageLink = ''"
							class="h-full grow-0"
						/>
						<IconButton
							name="Use link"
							icon="images/icons/check.png"
							@click="useImageLink"
							class="h-full grow-0"
						/>
					</div>
				</div>
			</div>
		</div>
	</Modal>
</template>
