import {computed} from "vue"
import type {CustomRole} from "../components/CustomRoleItem.vue"
import roles from "./roles.json"
import settings from "./settings.mts"

export interface RoleData {
	name: string
	alignment: Alignment
	isAlignmentRole: boolean // "Any {{alignment}}"
	optional: boolean
	id: number // Unique key for v-for
}

export type Alignment =
	| "Murderous"
	| "Dark Innocent"
	| "Neutral"
	| "True Neutral"
	| "Undead"
	| "Hungry"
	| "None"
	| "Innocent"
	| "Unknown"
const alignmentList: Alignment[] = [
	"Murderous",
	"Dark Innocent",
	"Neutral",
	"True Neutral",
	"Undead",
	"Hungry",
	"None",
	"Innocent",
	"Unknown",
]

const roleList: string[] = []
const roleAlignments: Record<string, Alignment> = {}

for (const [alignment, alignmentRoles] of Object.entries(roles)) {
	if (alignment === "Unknown") continue // Prevent recursion

	for (const role of alignmentRoles) {
		;(roles as Record<Alignment, string[]>).Unknown.push(role)
		roleList.push(role)
		roleAlignments[role] = alignment as Alignment
	}
}

roleAlignments.Acquaintance = "True Neutral"

const completeRoleList = computed(() => {
	const completeRoleList = [...roleList]

	settings.userSettings.customRoles.forEach((customRole) => {
		completeRoleList.push(customRole.name)
	})

	return completeRoleList
})

const completeRolesByAlignment = computed(() => {
	const completeRolesByAlignment: Record<Alignment, string[]> = structuredClone(roles)

	settings.userSettings.customRoles.forEach((customRole) => {
		if (customRole.alignment !== "Unknown") {
			completeRolesByAlignment.Unknown.push(customRole.name)
		}
		completeRolesByAlignment[customRole.alignment].push(customRole.name)
	})

	return completeRolesByAlignment
})

export default {
	roleList,
	alignmentList,
	completeRoleList,
	roleAlignments,
	rolesByAlignment: roles as Record<Alignment, string[]>,
	completeRolesByAlignment,
	isValidRole,
	isVanillaRole,
	isCustomRole,
	getCustomRole,
	getRoleIcon,
	getRoleAlignment,
	getRoleLink,
	generateRoleId,
}

function isValidRole(role: string): boolean {
	return isVanillaRole(role) || isCustomRole(role)
}

function isVanillaRole(role: string): boolean {
	return roleList.indexOf(role) !== -1
}

function isCustomRole(role: string): boolean {
	const customRole = settings.userSettings.customRoles.find((customRole) => {
		return customRole.name === role
	})
	return customRole !== undefined
}

function getCustomRole(name: string): CustomRole | undefined {
	return settings.userSettings.customRoles.find((customRole) => {
		return customRole.name === name
	})
}

function getRoleIcon(role: string): string {
	if (isVanillaRole(role)) {
		// Non custom role (hardcoded icon)
		return `images/roles/${role}.png`
	} else {
		return isCustomRole(role) ? getCustomRole(role)!.icon : "images/roles/Placeholder.png"
	}
}

function getRoleAlignment(role: string): Alignment {
	const alignment = roleAlignments[role]
	if (alignment) return alignment

	const customRole = settings.userSettings.customRoles.find((customRole) => {
		return customRole.name === role
	})
	if (customRole) return customRole.alignment

	return "Unknown"
}

function getRoleLink(role: string) {
	if (isVanillaRole(role)) {
		return `https://massacards.miraheze.org/wiki/${role}`.replaceAll(" ", "_")
	} else {
		return isCustomRole(role) ? getCustomRole(role)!.link : ""
	}
}

function generateRoleId(): number {
	return Date.now()
}
