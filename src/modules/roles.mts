import roles from "./roles.json"

export interface RoleData {
	name: string
	alignment: Alignment
	isAlignmentRole: boolean // "Any {{alignment}}"
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

const roleList: string[] = []
const roleAlignments: Record<string, Alignment> = {}

for (const [alignment, alignmentRoles] of Object.entries(roles)) {
	if (alignment === "Unknown") continue // Prevent recursion

	for (const role of alignmentRoles) {
		;(roles.Unknown as string[]).push(role)
		roleList.push(role)
		roleAlignments[role] = alignment as Alignment
	}
}

roleAlignments.Acquaintance = "True Neutral"

export default {
	roleList: roleList,
	roleAlignments: roleAlignments,
	rolesByAlignment: roles as Record<Alignment, string[]>,
}
