// @ts-check
// Would really like to use actual TS for this... oh well

// Modules
import assert from "./Modules/assert.mjs"
import randomElement from "./Modules/randomElement.mjs"
import removeItem from "./Modules/removeItem.mjs"

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
const UrlSearchParams = new URLSearchParams(window.location.search)

const randomizeScenarioButton = assert(document.getElementById("randomize-scenario"))
const roleContainer = assert(document.getElementById("role-container"))
const role = assert(document.getElementById("role-template")).content.getElementById("role")
const createRoleButton = assert(document.getElementById("insert-role"))

const randomizationSettings = {
	AllowDuplicates: false,
}
const currentRoles = []


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

function getRoleAlignment(roleName) {
	for (const [alignmentName, alignmentRoles] of Object.entries(ROLES)) {
		if (alignmentRoles.find((element) => (element === roleName))) {
			return alignmentName
		}
	}

	console.warn("Could not get alignment of role:", roleName)
}

async function createRole(name, alignment) {
	const newRole = role.cloneNode(true)

	const roleStruct = {
		Role: newRole,
		RoleName: newRole.getElementsByClassName("role-name")[0],
		RoleImage: newRole.getElementsByClassName("role-image")[0],

		RemoveRoleButton: newRole.getElementsByClassName("remove-role")[0],
		DuplicateRoleButton: newRole.getElementsByClassName("duplicate-role")[0],

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
	let rolePool = alignment === "Unknown" ? UNSORTED_ROLES : ROLES[alignment]

	if (!randomizationSettings.AllowDuplicates) {
		const newRolePool = [...rolePool] // Clones rolePool for mutation
		let rolesToBeRandomized = 0

		for (const existingRole of currentRoles) {
			const wasRemoved = removeItem(newRolePool, existingRole.Name)

			if (wasRemoved && !existingRole.Locked) {
				rolesToBeRandomized++
			}
		}

		if (rolesToBeRandomized < rolePool.length) rolePool = newRolePool
	}

	return randomElement(rolePool)
}

function randomizeRole(role, bypassLock) {
	if (role.Locked && !bypassLock) return
	
	updateRoleName(role, getRandomRoleName(role.Alignment), true)
}

function randomizeScenario() {
	for (const role of currentRoles) {
		randomizeRole(role)
	}
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

	role.RemoveRoleButton.onclick = function() {
		role.Role.remove()
		removeItem(currentRoles, role)
	}

	role.DuplicateRoleButton.onclick = async function() {
		addRole(await createRole(role.Name, role.Alignment))
	}

	role.RoleName.onchange = () => (shrinkTextOnOverflow(role.RoleName))
	role.RoleName.onkeypress = () => (shrinkTextOnOverflow(role.RoleName))
	role.AlignmentName.onchange = () => (shrinkTextOnOverflow(role.AlignmentName))
	role.AlignmentName.onkeypress = () => (shrinkTextOnOverflow(role.AlignmentName))
	
	roleContainer.appendChild(role.Role)
	shrinkTextOnOverflow(role.AlignmentName)

	currentRoles.push(role)
}

randomizeScenarioButton.onclick = randomizeScenario

createRoleButton.onclick = async function() {
	if (!currentRoles.find((role) => (role.Name === "Killer" || role.Name === "Massacre"))) addRole(await createRole("Killer", "Murderous"))
	else if (!currentRoles.find((role) => (role.Name === "Private Eye" || role.Name === "Hero"))) addRole(await createRole("Private Eye", "Dark Innocent"))
	else if (!currentRoles.find((role) => (role.Name === "Witness"))) addRole(await createRole("Witness", "Innocent"))
	else addRole(await createRole("Bystander", "Innocent"))
}

async function createDefaultRoles() {
	const killer = await createRole("Killer", "Murderous")
	const privateEye = await createRole("Private Eye", "Dark Innocent")
	const witness = await createRole("Witness", "Innocent")

	killer.Locked = true
	killer.LockButton.dataset.enabled = "true"
	privateEye.Locked = true
	privateEye.LockButton.dataset.enabled = "true"
	witness.Locked = true
	witness.LockButton.dataset.enabled = "true"

	addRole(killer)
	addRole(privateEye)
	addRole(witness)
}

async function createRolesFromUriComponent(rolesString) {
	const roles = rolesString.split("_")

	for (const role of roles) {
		addRole(await createRole(role, getRoleAlignment(role)))
	}
}

function createUriRolesComponent(roles) {
	let uriComponent = ""

	for (const role of roles) {
		uriComponent = uriComponent.concat(role.Name + "_")
	}

	return "?roles=" + encodeURIComponent(uriComponent)
}


// Initialization

if (UrlSearchParams.has("roles")) {
	createRolesFromUriComponent(UrlSearchParams.get("roles"))
} else {
	createDefaultRoles()
}