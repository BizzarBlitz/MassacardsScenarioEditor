export default function getRandomElement<T>(arr: T[]): T {
	if (arr.length === 0) {
		throw new Error("Cannot get random element of array with no elements")
	}
	return arr[Math.floor(Math.random() * arr.length)]
}
