import settings from "../settings.mts"
import type {RoleData} from "../roles.mts"

const REQUIRED_ROLE_NAMES = ["Massacre", "Killer", "Hero", "Private Eye", "Witness"] // In sort order
const SUPER_ROLE_NAMES = [
	"Patient Zero",
	"Fungus",
	"Bleeder",
	"Bioweapon",
	"Experiment",
	"Biter",
	"Mummy",
	"Massacre",
	"Hero",
	"Warlock",
	"Suspicious",
	"Monster",
	"Deity of Death",
	"Deity of Denial",
	"Deity of Anger",
	"Deity of Bargaining",
	"Deity of Depression",
	"Deity of Acceptance",
]

function getLightsOutPriority(role: RoleData) {
	if (role.name === "Private Eye") {
		return -1
	}

	return settings.sortOrders.lightsOut.indexOf(role.alignment)
}

function compareBooleans(a: boolean, b: boolean, prioritizedValue: boolean) {
	const aValue = Number(a)
	const bValue = Number(b)
	return prioritizedValue === true ? bValue - aValue : aValue - bValue
}

export default function sortRoles(roles: RoleData[]) {
	roles.sort((aRole, bRole) => {
		// Isolate required roles
		if (settings.controls.sortRoles.isolateRequiredRoles) {
			const aIndex = REQUIRED_ROLE_NAMES.indexOf(aRole.name)
			const bIndex = REQUIRED_ROLE_NAMES.indexOf(bRole.name)

			const aIsRequired = aIndex !== -1 && !aRole.isAlignmentRole
			const bIsRequired = bIndex !== -1 && !bRole.isAlignmentRole

			if (aIsRequired && bIsRequired) {
				return aIndex - bIndex
			} else if (aIsRequired) {
				return -1
			} else if (bIsRequired) {
				return 1
			}
		}

		// Sort by alignment
		if (settings.controls.sortRoles.sortBy === "Alignment" && aRole.alignment !== bRole.alignment) {
			return (
				settings.sortOrders.alignment.indexOf(aRole.alignment) -
				settings.sortOrders.alignment.indexOf(bRole.alignment)
			)
		}

		// Sort by lights out
		if (settings.controls.sortRoles.sortBy === "Lights out phase") {
			const aLightsOutPriority = getLightsOutPriority(aRole)
			const bLightsOutPriority = getLightsOutPriority(bRole)

			if (aLightsOutPriority !== bLightsOutPriority) {
				return aLightsOutPriority - bLightsOutPriority
			}
		}

		// Push back optional roles
		if (aRole.optional !== bRole.optional) {
			return compareBooleans(aRole.optional, bRole.optional, false)
		}

		// Push back alignment roles
		if (aRole.isAlignmentRole !== bRole.isAlignmentRole) {
			return compareBooleans(aRole.isAlignmentRole, bRole.isAlignmentRole, false)
		}

		// Prioritize super roles
		if (settings.controls.sortRoles.prioritizeSuperRoles) {
			const aIsSuperRole = SUPER_ROLE_NAMES.indexOf(aRole.name) !== -1
			const bIsSuperRole = SUPER_ROLE_NAMES.indexOf(bRole.name) !== -1

			if (aIsSuperRole !== bIsSuperRole) {
				return compareBooleans(aIsSuperRole, bIsSuperRole, true)
			}
		}

		if (settings.controls.sortRoles.sortBy === "Name") {
			return aRole.name.localeCompare(bRole.name)
		}

		return 0
	})
}
