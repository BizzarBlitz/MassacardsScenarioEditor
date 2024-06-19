// @ts-check
// Would really like to use actual TS for this... oh well

// Modules
import Role from "./Modules/Classes/Role.mjs"

import assert from "./Modules/assert.mjs"
import fitText from "./Modules/fitText.mjs"



// Variables
const UrlSearchParams = new URLSearchParams(window.location.search)

const ShareRoleNode = assert(document.getElementById("share-role-template")).content.getElementById("share-role")

const shareButton = assert(document.getElementById("share"))
const shareModal = assert(document.getElementById("share-modal"))
const closeShareModalButton = assert(document.getElementById("close-share"))
const shareScenarioName = assert(document.getElementById("share-scenario-name"))
const shareScenario = assert(document.getElementById("share-scenario"))

const randomizeScenarioButton = assert(document.getElementById("randomize-scenario"))
const scenarioName = assert(document.getElementById("scenario-name"))
const roleContainer = assert(document.getElementById("role-container"))
const createRoleButton = assert(document.getElementById("insert-role"))

const randomizationSettings = {
	AllowDuplicates: false,
}


// Functions

function getRoleAfterMouse(mouseX, mouseY) {
	const roles = [...Role.AddedRoles]

	// Find closest role on X axis
	let closestHorizontalRoles = []
	let closestOffsetX = Number.NEGATIVE_INFINITY // Aiming for closest to 0
	
	roles.forEach((role) => {
		const rect = role.Elements.Role.getBoundingClientRect()
		const offsetX = mouseX - rect.left - rect.width / 2
		const offsetY = mouseY - rect.top - rect.height / 2

		const isRoleAfter = offsetX < 0
		if (!isRoleAfter) return // Note return acts like continue inside forEach

		if (offsetX === closestOffsetX) {
			closestHorizontalRoles.push({
				Role: role,
				OffsetX: offsetX,
				OffsetY: offsetY,
			})
		}
		else if (offsetX > closestOffsetX) {
			closestOffsetX = offsetX

			closestHorizontalRoles = [{
				Role: role,
				OffsetX: offsetX,
				OffsetY: offsetY,
			}]
		}
	})

	// Find closest role on Y axis
	let closestVerticalRole = closestHorizontalRoles[0]
	let closestOffsetY = Number.NEGATIVE_INFINITY

	closestHorizontalRoles.forEach((role) => {
		const isRoleAfter = role.OffsetY < 0
		if (!isRoleAfter) return // Note return acts like continue inside forEach

		if (role.OffsetY > closestOffsetY) {
			closestOffsetY = role.OffsetY
			closestVerticalRole = role
		}
	})

	if (!closestVerticalRole) {
		closestHorizontalRoles.forEach((role) => {
			if (!closestVerticalRole || closestVerticalRole.OffsetY > role.OffsetY) {
				closestVerticalRole = role
			}
		})
	}

	return closestVerticalRole?.Role
}

function roleContainerDragOver(event) {
	event.preventDefault()

	const afterRole = getRoleAfterMouse(event.clientX, event.clientY)
	const draggingElement = document.querySelector(".dragging")

	if (afterRole) roleContainer.insertBefore(draggingElement, afterRole.Elements.Role)
	else roleContainer.appendChild(draggingElement)
}

randomizeScenarioButton.onclick = function() {
	for (const role of Role.AddedRoles) {
		role.randomize()
	}
}

createRoleButton.onclick = function() {
	if (!Role.AddedRoles.find((role) => (role.Name === "Killer" || role.Name === "Massacre"))) new Role("Killer", "Murderous").add(roleContainer)
	else if (!Role.AddedRoles.find((role) => (role.Name === "Private Eye" || role.Name === "Hero"))) new Role("Private Eye", "Dark Innocent").add(roleContainer)
	else if (!Role.AddedRoles.find((role) => (role.Name === "Witness"))) new Role("Witness", "Innocent").add(roleContainer)
	else new Role("Bystander", "Innocent").add(roleContainer)
}

function createDefaultRoles() {
	const killer = new Role("Killer", "Murderous")
	const privateEye = new Role("Private Eye", "Dark Innocent")
	const witness = new Role("Witness", "Innocent")

	killer.Locked = true
	privateEye.Locked = true
	witness.Locked = true

	killer.add(roleContainer)
	privateEye.add(roleContainer)
	witness.add(roleContainer)
}

function createRolesFromUriComponent(rolesString) {
	const roles = rolesString.split("_")

	for (const roleName of roles) {
		new Role(roleName, Role.getAlignmentFromRoleName(roleName)).add(roleContainer)
	}
}

function createUriRolesComponent(roles) {
	let uriComponent = ""

	for (const role of roles) {
		uriComponent = uriComponent.concat(role.Name + "_")
	}

	return "?roles=" + encodeURIComponent(uriComponent)
}

function openShareModal() {
	shareScenarioName.textContent = scenarioName.value

	for (const role of roleContainer.children) {
		if (role.id === "insert-role") continue

		const roleName = role.getElementsByClassName("role-name")[0]
		const roleImage = role.getElementsByClassName("role-image")[0]

		const shareRole = ShareRoleNode.cloneNode(true)
		const shareRoleName = shareRole.getElementsByClassName("share-role-name")[0]
		const shareRoleImage = shareRole.getElementsByClassName("share-role-image")[0]

		shareRoleName.textContent = roleName.value
		shareRoleImage.src = roleImage.src
		shareRoleImage.alt = roleImage.alt

		shareScenario.appendChild(shareRole)
	}
	
	shareModal.showModal()
}

function closeShareModal(event) {
	if (event.target !== event.currentTarget) return

	shareModal.close()

	// Remove roles
	while (shareScenario.firstChild) {
		shareScenario.removeChild(shareScenario.lastChild);
	}
}



// Event Listeners

shareButton.onclick = openShareModal
shareModal.onclick = closeShareModal
closeShareModalButton.onclick = closeShareModal
roleContainer.addEventListener("dragover", roleContainerDragOver)



// Initialization

if (UrlSearchParams.has("roles")) {
	createRolesFromUriComponent(UrlSearchParams.get("roles"))
} else {
	createDefaultRoles()
}