export default function(value, errorMessage) {
	if (value) {
		return value
	}

	throw errorMessage || "Assertion failed"
}