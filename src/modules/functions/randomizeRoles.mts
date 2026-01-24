import roles, {type Alignment, type RoleData} from "../roles.mts"
import getRandomElement from "./getRandomElement.mts"

export interface RandomizeSettings {
	allowDuplicates: boolean
	maintainAlignments: boolean
	preserveRequiredRoles: boolean
	allowReplaceableSuperRoles: boolean
}

type RoleNamePool = string[] | Record<Alignment, string[]>

const replaceableSuperRoles: Record<string, string> = {
	Killer: "Massacre",
	"Private Eye": "Hero",
	Cannibal: "Monster",
	Fool: "Suspicious",
	"Witch Doctor": "Warlock",
}

function findRole(scenarioRoles: RoleData[], roleName: string): RoleData | undefined {
	return scenarioRoles.find((role) => role.name === roleName)
}

function getExistingRequiredRoles(scenarioRoles: RoleData[]): RoleData[] {
	// Prioritize super roles over regular ones
	const existingRequiredRoles: RoleData[] = []

	// Massacre/Killer
	const massacre = findRole(scenarioRoles, "Massacre")
	if (massacre) {
		existingRequiredRoles.push(massacre)
	} else {
		const killer = findRole(scenarioRoles, "Killer")
		if (killer) {
			existingRequiredRoles.push(killer)
		}
	}

	// Hero/Private Eye
	const hero = findRole(scenarioRoles, "Hero")
	if (hero) {
		existingRequiredRoles.push(hero)
	} else {
		const privateEye = findRole(scenarioRoles, "Private Eye")
		if (privateEye) {
			existingRequiredRoles.push(privateEye)
		}
	}

	// Witness
	const witness = findRole(scenarioRoles, "Witness")
	if (witness) {
		existingRequiredRoles.push(witness)
	}

	return existingRequiredRoles
}

function getNameList(roleNamePool: RoleNamePool, alignment: Alignment): string[] {
	return Array.isArray(roleNamePool) ? roleNamePool : roleNamePool[alignment === "True Neutral" ? "Neutral" : alignment]
}

function getRandomRoleName(roleNamePool: RoleNamePool, alignment: Alignment): string {
	return getRandomElement(getNameList(roleNamePool, alignment))
}

function getRoleNamePool(maintainAlignments: boolean): RoleNamePool {
	if (maintainAlignments) {
		return structuredClone(roles.completeRolesByAlignment.value)
	} else {
		return [...roles.completeRoleList.value]
	}
}

function removeRoleNameFromPool(roleNamePool: RoleNamePool, name: string, alignment: Alignment): boolean {
	const nameList = getNameList(roleNamePool, alignment)
	const index = nameList.indexOf(name)

	if (index === -1) return false

	nameList.splice(index, 1)
	return true
}

function removeRequiredRolesFromTargets(targets: RoleData[], scenarioRoles: RoleData[]) {
	const existingRequiredRoles = getExistingRequiredRoles(scenarioRoles)
	existingRequiredRoles.forEach((role) => {
		const index = targets.indexOf(role)
		if (index !== -1) {
			targets.splice(index, 1)
		}
	})
}

function removeReplaceableSuperRolesFromNamePool(
	roleNamePool: RoleNamePool,
	targets: RoleData[],
	scenarioRoles: RoleData[],
) {
	const existingReplaceableRoles = [
		findRole(scenarioRoles, "Killer"), // Massacre
		findRole(scenarioRoles, "Private Eye"), // Hero
		findRole(scenarioRoles, "Witch Doctor"), // Warlock
		findRole(scenarioRoles, "Fool"), // Suspicious
		findRole(scenarioRoles, "Cannibal"), // Monster
	].filter((role) => {
		return role !== undefined && targets.indexOf(role) === -1
	}) as RoleData[]

	existingReplaceableRoles.forEach((role) => {
		const superRoleName = replaceableSuperRoles[role.name]
		const superRoleAlignment = roles.getRoleAlignment(superRoleName)
		removeRoleNameFromPool(roleNamePool, superRoleName, superRoleAlignment)
	})
}

function removeExistingRolesFromNamePool(roleNamePool: RoleNamePool, targets: RoleData[], scenarioRoles: RoleData[]) {
	const clonedRoleNamePool = structuredClone(roleNamePool)
	const rolesToRemove: RoleData[] = []

	scenarioRoles.forEach((role) => {
		if (targets.indexOf(role) === -1) {
			const didRemove = removeRoleNameFromPool(clonedRoleNamePool, role.name, role.alignment)
			if (didRemove) {
				rolesToRemove.push(role)
			}
		}
	})

	rolesToRemove.forEach((role) => {
		if (getNameList(roleNamePool, role.alignment).length === 0) return

		removeRoleNameFromPool(roleNamePool, role.name, role.alignment)
	})
}

function ignoreAlignmentRoles(targets: RoleData[], scenarioRoles: RoleData[]) {
	for (let index = targets.length - 1; index >= 0; index--) {
		const role = targets[index]
		if (role.isAlignmentRole) {
			targets.splice(index, 1)
		}
	}

	for (let index = scenarioRoles.length - 1; index >= 0; index--) {
		const role = scenarioRoles[index]
		if (role.isAlignmentRole) {
			scenarioRoles.splice(index, 1)
		}
	}
}

export default function randomizeRoles(targets: RoleData[], scenarioRoles: RoleData[], settings: RandomizeSettings) {
	const roleNamePool: RoleNamePool = getRoleNamePool(settings.maintainAlignments)
	const clonedRoleNamePool = getRoleNamePool(settings.maintainAlignments)
	const isSoloRole = targets.length === 1

	targets = [...targets]
	scenarioRoles = [...scenarioRoles]

	if (!isSoloRole) {
		ignoreAlignmentRoles(targets, scenarioRoles)
	}

	if (!isSoloRole && settings.preserveRequiredRoles) {
		removeRequiredRolesFromTargets(targets, scenarioRoles)
	}

	// Remove existing roles from pool so they don't duplicate (excluding roles to be randomized)
	if (!settings.allowDuplicates) {
		removeExistingRolesFromNamePool(roleNamePool, targets, scenarioRoles)
	}

	if (!settings.allowReplaceableSuperRoles) {
		removeReplaceableSuperRolesFromNamePool(roleNamePool, targets, scenarioRoles)
	}

	// Actually randomize roles
	targets.forEach((role) => {
		const isRoleNamePoolEmpty = getNameList(roleNamePool, role.alignment).length === 0
		const roleName = getRandomRoleName(isRoleNamePoolEmpty ? clonedRoleNamePool : roleNamePool, role.alignment)
		role.name = roleName

		if (!settings.allowDuplicates && !isRoleNamePoolEmpty) {
			removeRoleNameFromPool(roleNamePool, role.name, role.alignment)
		}

		const replaceableSuperRoleName = replaceableSuperRoles[roleName]
		if (!settings.allowReplaceableSuperRoles && replaceableSuperRoleName) {
			removeRoleNameFromPool(roleNamePool, replaceableSuperRoleName, roles.getRoleAlignment(replaceableSuperRoleName))
		}
	})
}
