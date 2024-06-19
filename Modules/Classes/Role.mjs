// @ts-check

// Modules

import assert from "../assert.mjs"
import fitText from "../fitText.mjs"
import randomElement from "../randomElement.mjs"
import removeItem from "../removeItem.mjs"

// Constants

const FILE_PREFIX = "./Images/"

const ALIGNMENTS = (await fetch("./Modules/alignments.json").then((response) => (response.json()))).alignments
const ROLES = await fetch("./Modules/roles.json").then((response) => (response.json()))

const UNSORTED_ROLES = (() => {
	let unsortedRoles = []

	for (const [_, roles] of Object.entries(ROLES)) {
		unsortedRoles = unsortedRoles.concat(roles)
	}

	return unsortedRoles
})()

const RoleNode = assert(document.getElementById("role-template")).content.getElementById("role")



// Functions

function roleDragStart() {
	this.classList.add("dragging")
}

function roleDragEnd() {
	this.classList.remove("dragging")
}



// Class

export default class Role {
	static AddedRoles = []

	#Locked
	Locked

	static getAlignmentFromRoleName(roleName) {
		for (const [alignmentName, alignmentRoles] of Object.entries(ROLES)) {
			if (alignmentRoles.find((element) => (element === roleName))) return alignmentName
		}

		console.warn("Could not get alignment of role:", roleName)
	}

	static getRandomRoleName(alignment, randomizationSettings) {
		randomizationSettings ??= {}
		let rolePool = alignment === "Unknown" ? UNSORTED_ROLES : ROLES[alignment]

		if (!randomizationSettings.AllowDuplicates) {
			const newRolePool = [...rolePool] // Duplicates rolePool for mutation
			let rolesToBeRandomized = 0

			for (const existingRole of Role.AddedRoles) {
				if (existingRole === randomizationSettings.Role) continue

				const wasRemoved = removeItem(newRolePool, existingRole.Name)
				if (wasRemoved && !existingRole.Locked) {
					rolesToBeRandomized++
				}
			}

			if (rolesToBeRandomized < rolePool.length) rolePool = newRolePool
		}

		return randomElement(rolePool)
	}

	constructor(name, alignment) {
		const thisRole = this
		const newRoleNode = RoleNode.cloneNode(true)

		this.Name = name
		this.Alignment = alignment
		this.AlignmentIndex = ALIGNMENTS.indexOf(alignment)
		this.#Locked = false

		this.Elements = {
			Role: newRoleNode,
			DragDetector: newRoleNode.getElementsByClassName("drag-detector")[0],

			RoleName: newRoleNode.getElementsByClassName("role-name")[0],
			RoleImage: newRoleNode.getElementsByClassName("role-image")[0],

			RemoveRoleButton: newRoleNode.getElementsByClassName("remove-role")[0],
			DuplicateRoleButton: newRoleNode.getElementsByClassName("duplicate-role")[0],

			RandomizeButton: newRoleNode.getElementsByClassName("role-button randomize")[0],
			LockButton: newRoleNode.getElementsByClassName("role-button lock")[0],
			LockButtonImage: newRoleNode.getElementsByClassName("role-button-image lock")[0],

			AlignmentName: newRoleNode.getElementsByClassName("alignment-name")[0],
			AlignmentImage: newRoleNode.getElementsByClassName("alignment-image")[0],
			PreviousAlignmentButton: newRoleNode.getElementsByClassName("arrow left-arrow")[0],
			NextAlignmentButton: newRoleNode.getElementsByClassName("arrow right-arrow")[0],
		}

		Object.defineProperty(this, "Locked", {
			set(locked) {
				this.#Locked = locked
				thisRole.Elements.LockButton.dataset.enabled = locked ? "true" : "false"
				thisRole.Elements.LockButtonImage.src = FILE_PREFIX + "Icons/" + (locked ? "Locked.png" : "Unlocked.png")
				thisRole.Elements.LockButtonImage.alt = locked ? "Locked" : "Unlocked"
			},

			get() {
				return this.#Locked
			}
		})
	}

	updateRoleName(name, wasNameValid) {
		this.Elements.RoleName.value = wasNameValid ? name : "Invalid role"
		this.Elements.RoleImage.src = FILE_PREFIX + `Roles/${name}.png`
		this.Elements.RoleImage.alt = name

		this.Name = name

		fitText(this.Elements.RoleName)
	}

	parseRoleName() {
		const thisRole = this
		let roleName = this.Elements.RoleName.value
		let validRoleName = true

		fetch(FILE_PREFIX + `Roles/${roleName}.png`).then(function(response) {
			if (response.status === 404) {
				// Invalid role name
				console.warn("Invalid role name:", roleName)
				roleName = "Placeholder"
				validRoleName = false
			}

			thisRole.updateRoleName(roleName, validRoleName)
		})
	}

	updateRoleAlignment(alignment, wasAlignmentValid) {
		let alignmentNameText

		this.Elements.AlignmentName.value = wasAlignmentValid ? alignment : "Invalid alignment"

		setTimeout(() => {
			if (this.Elements.AlignmentName.value !== alignmentNameText) return

			this.Elements.AlignmentName.value = alignment
			fitText(this.Elements.AlignmentName)
		}, 1000)
		
		this.Elements.AlignmentImage.src = FILE_PREFIX + `/Alignments/${alignment}.png`
		this.Elements.AlignmentImage.alt = alignment

		this.Alignment = alignment
		this.AlignmentIndex = ALIGNMENTS.indexOf(alignment)

		alignmentNameText = this.Elements.AlignmentName.value

		fitText(this.Elements.AlignmentName)
	}

	parseAlignmentName() {
		const thisRole = this
		let alignmentName = this.Elements.AlignmentName.value
		let validAlignmentName = true

		fetch(FILE_PREFIX + `Alignments/${alignmentName}.png`).then(function (response) {
			if (response.status === 404) {
				// Invalid alignment name
				console.warn("Invalid alignment name:", alignmentName)
				alignmentName = "Unknown"
				validAlignmentName = false
			}

			thisRole.updateRoleAlignment(alignmentName, validAlignmentName)
		})
	}

	setToAny(alignment) {
		alignment ??= this.Alignment

		this.Elements.RoleName.value = "Any " + (alignment === "Unknown" ? "Role" : alignment)
		this.Elements.RoleImage.src = FILE_PREFIX + `Alignments/${alignment}.png`

		fitText(this.Elements.RoleName)
	}

	incrementAlignmentIndex(increment) {
		this.AlignmentIndex = (this.AlignmentIndex + increment) % (ALIGNMENTS.length)
		if (this.AlignmentIndex === -1) this.AlignmentIndex = ALIGNMENTS.length - 1 // Because modulus doesn't do what I want it to with negatives

		this.updateRoleAlignment(ALIGNMENTS[this.AlignmentIndex], true)
	}

	duplicate() {
		const newRole = new Role(this.Name, this.Alignment)

		newRole.Locked = this.Locked
		newRole.add(assert(this.Elements.Container, "Attempt to duplicate role outside container"), this.Elements.Role.nextSibling)
	}

	randomize(bypassLock, randomizationSettings) {
		if (this.Locked && !bypassLock) return

		this.updateRoleName(Role.getRandomRoleName(this.Alignment, randomizationSettings), true)
	}

	add(container, before) {
		const thisRole = this

		this.Elements.RoleName.addEventListener("keydown", function(event) {
			if (event.key !== "Enter") return;
			thisRole.parseRoleName()
		})

		this.Elements.AlignmentName.addEventListener("keydown", function(event) {
			if (event.key !== "Enter") return;
			thisRole.parseAlignmentName()
		})

		this.Elements.AlignmentImage.onclick = () => (thisRole.setToAny(thisRole.Alignment))

		this.Elements.PreviousAlignmentButton.onclick = () => (thisRole.incrementAlignmentIndex(-1))
		this.Elements.NextAlignmentButton.onclick = () => (thisRole.incrementAlignmentIndex(1))

		this.Elements.RandomizeButton.onclick = () => (thisRole.randomize(true))
		this.Elements.LockButton.onclick = () => (thisRole.Locked = !thisRole.Locked)

		this.Elements.RemoveRoleButton.onclick = () => (thisRole.remove())
		this.Elements.DuplicateRoleButton.onclick = () => (thisRole.duplicate())

		this.Elements.RoleName.onchange = () => (fitText(thisRole.Elements.RoleName))
		this.Elements.RoleName.onkeypress = () => (fitText(thisRole.Elements.RoleName))
		this.Elements.AlignmentName.onchange = () => (fitText(thisRole.Elements.AlignmentName))
		this.Elements.AlignmentName.onkeypress = () => (fitText(thisRole.Elements.AlignmentName))

		this.Elements.Role.addEventListener("dragstart", roleDragStart)
		this.Elements.Role.addEventListener("dragend", roleDragEnd)

		this.updateRoleName(this.Name, true)
		this.updateRoleAlignment(this.Alignment, true)

		this.Elements.Container = container
		container.insertBefore(this.Elements.Role, before)
		Role.AddedRoles.push(this)
	}

	remove() {
		this.Elements.Role.remove()
		removeItem(Role.AddedRoles, this)
	}
}