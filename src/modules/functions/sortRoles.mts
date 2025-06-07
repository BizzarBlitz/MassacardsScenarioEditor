import type {RoleData} from "../roles.mts"

export interface SortSettings {
	sortBy: string
	isolateRequiredRoles: boolean
	prioritizeSuperRoles: boolean
}

const requiredRoleNames = ["Witness", "Private Eye", "Hero", "Killer", "Massacre"] // In reverse sort order
const superRoleNames = [
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

const lightsOutOrder = [
	"Murderous",
	"Dark Innocent",
	"Neutral",
	"Undead",
	"Hungry",
	"None",
	"Innocent",
	"True Neutral",
	"Unknown",
]

const alignmentOrder = [
	"Murderous",
	"Dark Innocent",
	"Innocent",
	"Neutral",
	"True Neutral",
	"None",
	"Undead",
	"Hungry",
	"Unknown",
]

function getIntraAlignmentPriority(role: RoleData, prioritizeSuperRoles: boolean): number {
	if (role.isAlignmentRole) return -1
	if (prioritizeSuperRoles && superRoleNames.indexOf(role.name) !== -1) return 1
	return 0
}

function getLightsOutPriority(role: RoleData) {
	if (role.name === "Private Eye") {
		return -1
	}

	return lightsOutOrder.indexOf(role.alignment)
}

export default function sortRoles(roles: RoleData[], sortSettings: SortSettings) {
	roles.sort((aRole, bRole) => {
		// >0 = [b, a]
		// <0 = [a, b]
		// Check is role is required
		if (sortSettings.isolateRequiredRoles) {
			const aRequiredIndex = aRole.isAlignmentRole ? -1 : requiredRoleNames.indexOf(aRole.name)
			const bRequiredIndex = bRole.isAlignmentRole ? -1 : requiredRoleNames.indexOf(bRole.name)

			if (aRequiredIndex !== -1 || bRequiredIndex !== -1) {
				return bRequiredIndex - aRequiredIndex
			}
		}

		const aIntraAlignmentPriority = getIntraAlignmentPriority(aRole, sortSettings.prioritizeSuperRoles)
		const bIntraAlignmentPriority = getIntraAlignmentPriority(bRole, sortSettings.prioritizeSuperRoles)
		const intraAlignmentSortResult = bIntraAlignmentPriority - aIntraAlignmentPriority

		if (sortSettings.sortBy === "Lights out phase") {
			const lightsOutSortResult = getLightsOutPriority(aRole) - getLightsOutPriority(bRole)
			return lightsOutSortResult !== 0 ? lightsOutSortResult : intraAlignmentSortResult
		} else if (sortSettings.sortBy === "Alignment") {
			const alignmentSortResult = alignmentOrder.indexOf(aRole.alignment) - alignmentOrder.indexOf(bRole.alignment)
			return alignmentSortResult !== 0 ? alignmentSortResult : intraAlignmentSortResult
		} else if (sortSettings.sortBy === "Name") {
			if (intraAlignmentSortResult !== 0) {
				return intraAlignmentSortResult
			}

			const aName = aRole.isAlignmentRole ? aRole.alignment : aRole.name
			const bName = bRole.isAlignmentRole ? bRole.alignment : bRole.name

			if (aName > bName) return 1
			if (aName < bName) return -1
			return 0
		}

		return 0
	})
}
