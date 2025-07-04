import * as JSURL from "jsurl2"
import type {Alignment, RoleData} from "./roles.mts"
import generateRoleId from "./functions/generateRoleId.mts"
import roles from "./roles.mts"
import settings from "./settings.mts"

export type LinkData = {
	name: string
	roleNames: string[]
	scenarioSettings: typeof settings.scenario
}

const AbsoluteUrl: string = window.location.origin + window.location.pathname

function getNamesFromRoles(roles: RoleData[]): string[] {
	const roleNames: string[] = []

	roles.forEach((role, index) => {
		roleNames[index] = role.isAlignmentRole ? "-" + role.alignment : role.name
	})

	return roleNames
}

// MassacardsScenarioEditor V1 links
function parseLegacyLink(): LinkData | undefined {
	const params = new URLSearchParams(document.location.search)
	const name = params.get("name")
	const roleNames = params.get("roles")

	if (!name || !roleNames) {
		return
	}

	return {
		name: name,
		roleNames: roleNames.split("_"),
		scenarioSettings: {
			gamemode: undefined,
			guestNumberCards: undefined,
		},
	}
}

export function generateLink(roles: RoleData[], name: string, scenarioSettings: typeof settings.scenario): string {
	const roleNames: string[] = getNamesFromRoles(roles)

	return (
		AbsoluteUrl +
		"#" +
		JSURL.stringify(
			{
				n: name,
				r: roleNames,
				gm: scenarioSettings.gamemode,
				gnc: scenarioSettings.guestNumberCards,
			},
			{short: true},
		)
	)
}

export function parseLink(link: string): LinkData {
	const legacyLinkData = parseLegacyLink()
	if (legacyLinkData) {
		return legacyLinkData
	}

	const rawData = JSURL.tryParse(
		link.substring(1),
		{
			n: "Click to edit scenario name",
			r: ["Killer", "Private Eye", "Witness"],
			gm: undefined as boolean | undefined,
			gnc: undefined as boolean | undefined,
		},
		{deURI: true},
	)

	const name = typeof rawData.n === "string" ? rawData.n : "Click to edit scenario name"
	const roleNames = typeof rawData.r === "object" && rawData.r[0] ? rawData.r : ["Killer", "Private Eye", "Witness"]
	const gamemode = typeof rawData.gm === "string" ? rawData.gm : undefined
	const guestNumberCards = typeof rawData.gnc === "boolean" ? rawData.gnc : undefined

	return {
		name: name,
		roleNames: roleNames,
		scenarioSettings: {
			gamemode: gamemode,
			guestNumberCards: guestNumberCards,
		},
	}
}

export function generateRolesFromNames(roleNames: string[]): RoleData[] {
	const starterId = generateRoleId()
	const scenarioRoles: RoleData[] = []

	roleNames.forEach((roleName, index) => {
		roleName = roleName.toString()
		const isAlignmentRole = roleName.slice(0, 1) === "-"
		const isValidRole = isAlignmentRole
			? roles.rolesByAlignment[roleName as Alignment] !== undefined
			: roles.roleList.indexOf(roleName) !== -1

		if (!isValidRole) {
			scenarioRoles[index] = {
				name: "Bystander",
				alignment: "Unknown",
				isAlignmentRole: true,
				id: starterId + index,
			}
			return
		}

		scenarioRoles[index] = {
			name: isAlignmentRole ? "Bystander" : roleName,
			alignment: isAlignmentRole ? (roleName as Alignment) : roles.roleAlignments[roleName],
			isAlignmentRole: isAlignmentRole,
			id: starterId + index,
		}
	})

	return scenarioRoles
}
