export default function removeItem(arr, value) {
	const index = arr.indexOf(value)

	if (index > -1) {
		arr.splice(index, 1)
		return true
	}

	return false
}