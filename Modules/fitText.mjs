// From Stack Overflow: https://stackoverflow.com/a/56099826

function isOverflown(element) {
	return element.scrollWidth > element.clientWidth
}

async function delayedIsOverflown(element) {
	return await new Promise((resolve) => {
		requestAnimationFrame(() =>
			requestAnimationFrame(() => (
				resolve(isOverflown(element))
			))
		)
	})
}

export default async function(element) {
	if (element.dataset.isShrinking === true) return
	element.dataset.isShrinking = true

	const initialValue = element.value

	// await delayedIsOverflown(element)

	// let currentFontSize = Number((element.dataset.fontSize || window.getComputedStyle(element).fontSize).slice(0, -2)) // Trim "px" off
	let currentFontSize = 16

	function shrink() {
		currentFontSize -= 0.5
		element.style.fontSize = currentFontSize + "px"
	}

	element.style.fontSize = currentFontSize + "px"

	while (isOverflown(element) && initialValue === element.value) shrink()

	while (initialValue === element.value && await delayedIsOverflown(element)) shrink()

	element.dataset.fontSize = currentFontSize + 'px'
	element.dataset.isShrinking = false
}