// @ts-check
// Would really like to use actual TS for this... oh well

// Modules
import Role from "./Modules/Classes/Role.mjs"

import assert from "./Modules/assert.mjs"
import fitText from "./Modules/fitText.mjs"
import uriParser from "./Modules/uriParser.mjs"



// Variables
const UrlSearchParams = new URLSearchParams(window.location.search)

const ShareRoleNode = assert(document.getElementById("share-role-template")).content.getElementById("share-role")

const shareButton = assert(document.getElementById("share"))
const shareModal = assert(document.getElementById("share-modal"))
const closeShareModalButton = assert(document.getElementById("close-share"))
const shareScenarioName = assert(document.getElementById("share-scenario-name"))
const shareScenario = assert(document.getElementById("share-scenario"))
const shareLinkButton = assert(document.getElementById("copy-link"))

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
	else new Role("Bystander", "Unknown").add(roleContainer)
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

function openShareModal() {
	shareScenarioName.textContent = scenarioName.value

	for (const role of Role.getOrderedRoles(roleContainer)) {
		const shareRole = ShareRoleNode.cloneNode(true)
		const shareRoleName = shareRole.getElementsByClassName("share-role-name")[0]
		const shareRoleImage = shareRole.getElementsByClassName("share-role-image")[0]

		shareRoleName.textContent = role.Elements.RoleName.value
		shareRoleImage.src = role.Elements.RoleImage.src
		shareRoleImage.alt = role.Elements.RoleImage.alt

		shareScenario.appendChild(shareRole)
	}

	// TODO: Make scenario a canvas/image (like tiermaker does) (https://reference.codeproject.com/dom/canvas_api/drawing_dom_objects_into_a_canvas)

	// const canvasContext = assert(document.getElementById("test-canvas")).getContext("2d")
	// const newDoc = document.implementation.createHTMLDocument("canvasDoc")
	// newDoc.write(shareScenario.outerHTML)
	// newDoc.documentElement.setAttribute("xmlns", assert(newDoc.documentElement.namespaceURI, "namespaceURI not found on new document"))

	// const html = (new XMLSerializer).serializeToString(newDoc)
	// const DOMURL = window.URL

	// const img = new Image()
	// const svg = new Blob([html], { type: 'image/svg+xml;charset=utf-8' })
	// const url = DOMURL.createObjectURL(svg)

	// img.onload = function () {
	// 	canvasContext.drawImage(img, 50, 50)
	// 	DOMURL.revokeObjectURL(url)
	// }

	// img.src = // url
	
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

function copyShareLink() {
	navigator.clipboard.writeText(window.location.origin + window.location.pathname + uriParser.ConcatenateComponents([
		uriParser.Roles.Encode(Role.getOrderedRoles(roleContainer)),
		uriParser.ScenarioName.Encode(scenarioName.value),
	]))
}



// Event Listeners

shareButton.onclick = openShareModal
shareModal.onclick = closeShareModal
closeShareModalButton.onclick = closeShareModal
shareLinkButton.onclick = copyShareLink
roleContainer.addEventListener("dragover", roleContainerDragOver)



// Initialization

// Url Params
if (UrlSearchParams.has("roles")) {
	const roles = uriParser.Roles.Decode(UrlSearchParams.get("roles"))

	for (const role of roles) {
		role.add(roleContainer)
	}
} else {
	createDefaultRoles()
}

if (UrlSearchParams.has("name")) {
	scenarioName.value = uriParser.ScenarioName.Decode(UrlSearchParams.get("name"))
}