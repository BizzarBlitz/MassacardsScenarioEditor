// @ts-check
// Would really like to use actual TS for this... oh well

// Modules
import assert from "./Modules/assert.mjs"
import randomElement from "./Modules/randomElement.mjs"

// Assets
const ALIGNMENTS = (await fetch("./Modules/alignments.json").then((response) => (response.json()))).alignments
const ROLES = await fetch("./Modules/roles.json").then((response) => (response.json()))

const UNSORTED_ROLES = (() => {
	let unsortedRoles = []

	for (const [_, roles] of Object.entries(ROLES)) {
		unsortedRoles = unsortedRoles.concat(roles)
	}

	return unsortedRoles
})()



// Variables
const roleContainer = assert(document.getElementById("role-container"))
const role = await getRole()


// Functions

// From Stack Overflow (I'm pro dev I know): https://stackoverflow.com/a/56099826

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

async function shrinkTextOnOverflow(element) {
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

async function getRole() {
	const fetchPromise = new Promise(async (resolve) => {
		const responseString = await fetch("Prefabs/Role/role.html").then((response) => (response.text()))
		resolve(new DOMParser().parseFromString(responseString, "text/html"))
	}).catch((reason) => {
		console.log("Failed to fetch role.html (report bug pls)", reason)
	})

	const doc = await fetchPromise
	const role = doc.getElementById("role")

	return role
}

async function createRole(name, alignment) {
	const newRole = role.cloneNode(true)

	const roleStruct = {
		Role: newRole,
		RoleName: newRole.getElementsByClassName("role-name")[0],
		RoleImage: newRole.getElementsByClassName("role-image")[0],

		RandomizeButton: newRole.getElementsByClassName("role-button randomize")[0],
		LockButton: newRole.getElementsByClassName("role-button lock")[0],

		AlignmentName: newRole.getElementsByClassName("alignment-name")[0],
		AlignmentImage: newRole.getElementsByClassName("alignment-image")[0],
		PreviousAlignmentButton: newRole.getElementsByClassName("arrow left-arrow")[0],
		NextAlignmentButton: newRole.getElementsByClassName("arrow right-arrow")[0],

		Name: name,
		Alignment: alignment,
		AlignmentIndex: ALIGNMENTS.indexOf(alignment),
		Locked: false,
	}

	roleStruct.RoleName.value = name
	roleStruct.RoleImage.src = `Files/Roles/${name}.png`
	roleStruct.RoleImage.alt = name

	roleStruct.AlignmentName.value = alignment
	roleStruct.AlignmentImage.src = `Files/Alignments/${alignment}.png`

	return roleStruct
}

// Assumes roleName is valid
function updateRoleName(role, roleName, wasNameValid) {
	role.RoleName.value = wasNameValid ? roleName : "Invalid role"
	role.RoleImage.src = `Files/Roles/${roleName}.png`
	role.RoleImage.alt = roleName

	role.Name = roleName

	shrinkTextOnOverflow(role.RoleName)
}

// Assume alignment is valid
function updateRoleAlignment(role, alignment, wasAlignmentValid) {
	let alignmentNameText

	role.AlignmentName.value = wasAlignmentValid ? alignment : "Invalid alignment"
	setTimeout(() => {
		if (role.AlignmentName.value !== alignmentNameText) return
		role.AlignmentName.value = alignment; shrinkTextOnOverflow(role.AlignmentName)
	}, 1000)
	role.AlignmentImage.src = `Files/Alignments/${alignment}.png`
	role.AlignmentImage.alt = alignment

	role.Alignment = alignment
	role.AlignmentIndex = ALIGNMENTS.indexOf(alignment)

	alignmentNameText = role.AlignmentName.value

	shrinkTextOnOverflow(role.AlignmentName)
}

function getRandomRoleName(alignment) {
	return randomElement(alignment === "Unknown" ? UNSORTED_ROLES : ROLES[alignment])
}

function randomizeRole(role, bypassLock) {
	if (role.Locked && !bypassLock) return
	
	updateRoleName(role, getRandomRoleName(role.Alignment), true)
}

function addRole(role) {
	role.RoleName.addEventListener("keydown", function(event) {
		if (event.key !== "Enter") return;

		let roleName = role.RoleName.value
		let validRoleName = true

		fetch(`Files/Roles/${roleName}.png`).then(function(response) {
			if (response.status === 404) {
				// Invalid role name
				console.warn("Invalid role name:", roleName)
				roleName = "Placeholder"
				validRoleName = false
			}

			updateRoleName(role, roleName, validRoleName)
		})
	})

	role.AlignmentName.addEventListener("keydown", function(event) {
		if (event.key !== "Enter") return;

		let alignmentName = role.AlignmentName.value
		let validAlignmentName = true

		fetch(`Files/Alignments/${alignmentName}.png`).then(function(response) {
			console.log(response, response.text())
			if (response.status === 404) {
				// Invalid alignment name
				console.warn("Invalid alignment name:", alignmentName)
				alignmentName = "Unknown"
				validAlignmentName = false
			}

			updateRoleAlignment(role, alignmentName, validAlignmentName)
		})
	})

	role.AlignmentImage.onclick = function() {
		role.RoleName.value = "Any " + (role.Alignment === "Unknown" ? "Role" : role.Alignment)
		role.RoleImage.src = `Files/Alignments/${role.Alignment}.png`

		shrinkTextOnOverflow(role.RoleName)
	}

	role.PreviousAlignmentButton.onclick = function() {
		role.AlignmentIndex = ((role.AlignmentIndex - 1) % (ALIGNMENTS.length))
		if (role.AlignmentIndex === -1) role.AlignmentIndex = ALIGNMENTS.length - 1 // Because modulus doesn't do what I want it to with negatives

		updateRoleAlignment(role, ALIGNMENTS[role.AlignmentIndex], true)
	}

	role.NextAlignmentButton.onclick = function() {
		role.AlignmentIndex = (role.AlignmentIndex + 1) % (ALIGNMENTS.length)
		updateRoleAlignment(role, ALIGNMENTS[role.AlignmentIndex], true)
	}

	role.RandomizeButton.onclick = function() {
		randomizeRole(role, true)
	}

	role.LockButton.onclick = function() {
		role.Locked = !role.Locked
		role.LockButton.dataset.enabled = role.LockButton.dataset.enabled === "true" ? "false" : "true"
	}

	role.RoleName.onchange = () => (shrinkTextOnOverflow(role.RoleName))
	role.RoleName.onkeypress = () => (shrinkTextOnOverflow(role.RoleName))
	role.AlignmentName.onchange = () => (shrinkTextOnOverflow(role.AlignmentName))
	role.AlignmentName.onkeypress = () => (shrinkTextOnOverflow(role.AlignmentName))
	
	roleContainer.appendChild(role.Role)
	shrinkTextOnOverflow(role.AlignmentName)
}

async function createDefaultRoles() {
	const killer = await createRole("Killer", "Murderous")
	const privateEye = await createRole("Private Eye", "Dark Innocent")
	const witness = await createRole("Witness", "Innocent")

	addRole(killer)
	addRole(privateEye)
	addRole(witness)
}



// Initialization

createDefaultRoles()