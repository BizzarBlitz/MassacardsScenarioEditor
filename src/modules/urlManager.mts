import * as JSURL from "jsurl2"
import type {Alignment, RoleData} from "./roles.mts"
import roles from "./roles.mts"
import settings from "./settings.mts"

export type LinkData = {
	roleNames: string[]
	scenarioSettings: typeof settings.scenario
}

const AbsoluteUrl: string = window.location.origin + window.location.pathname

function getNamesFromRoles(roles: RoleData[]): string[] {
	const roleNames: string[] = []

	// Starting hyphen denotes alignment role, ending hyphen denotes optional role
	roles.forEach((role, index) => {
		roleNames[index] = (role.isAlignmentRole ? "-" + role.alignment : role.name) + (role.optional ? "-" : "")
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
		roleNames: roleNames.split("_"),
		scenarioSettings: {
			name: name || settings.scenario.name,
			gamemodes: settings.scenario.gamemodes,
			guestNumberCards: settings.scenario.guestNumberCards,
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
				gm: scenarioSettings.gamemodes,
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
			n: settings.scenario.name, // Name
			r: ["Killer", "Private Eye", "Witness"], // Roles
			gm: settings.scenario.gamemodes, // Gamemodes
			gnc: settings.scenario.guestNumberCards, // Guest number cards
		},
		{deURI: true},
	)

	const name = typeof rawData.n === "string" ? rawData.n : settings.scenario.name
	const roleNames = Array.isArray(rawData.r) ? rawData.r : ["Killer", "Private Eye", "Witness"]
	const gamemodes = Array.isArray(rawData.gm) ? rawData.gm : settings.scenario.gamemodes
	const guestNumberCards = typeof rawData.gnc === "boolean" ? rawData.gnc : settings.scenario.guestNumberCards

	return {
		roleNames: roleNames,
		scenarioSettings: {
			name: name,
			gamemodes: gamemodes,
			guestNumberCards: guestNumberCards,
		},
	}
}

export function generateRolesFromNames(roleNames: string[]): RoleData[] {
	const starterId = roles.generateRoleId()
	const scenarioRoles: RoleData[] = []

	roleNames.forEach((roleName, index) => {
		roleName = roleName.toString()
		const isAlignmentRole = roleName[0] === "-"
		if (isAlignmentRole) {
			roleName = roleName.slice(1)
		}

		const isOptionalRole = roleName[roleName.length - 1] === "-"
		if (isOptionalRole) {
			roleName = roleName.slice(0, roleName.length - 1)
		}

		const isValidRole = isAlignmentRole
			? roles.rolesByAlignment[roleName as Alignment] !== undefined
			: roles.isValidRole(roleName)

		if (!isValidRole) {
			scenarioRoles[index] = {
				name: "Bystander",
				alignment: "Unknown",
				isAlignmentRole: true,
				optional: isOptionalRole,
				id: starterId + index,
			}
			return
		} else {
			scenarioRoles[index] = {
				name: isAlignmentRole ? "Bystander" : roleName,
				alignment: isAlignmentRole ? (roleName as Alignment) : roles.getRoleAlignment(roleName),
				isAlignmentRole: isAlignmentRole,
				optional: isOptionalRole,
				id: starterId + index,
			}
		}
	})

	return scenarioRoles
}
