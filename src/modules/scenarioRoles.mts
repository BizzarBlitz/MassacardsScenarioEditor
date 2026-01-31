import {ref, watch} from "vue"
import * as urlManager from "../modules/urlManager.mts"

const scenarioRoles = ref(getScenarioRoles())
export default scenarioRoles

watch(
	scenarioRoles,
	(newScenarioRoles) => {
		const newScenarioRoleNames: string[] = []
		newScenarioRoles.forEach((role) => {
			newScenarioRoleNames.push(role.name)
		})

		sessionStorage.setItem("scenarioRoles", JSON.stringify(newScenarioRoleNames))
	},
	{deep: true},
)

function getScenarioRoles() {
	const linkData = urlManager.parseLink(window.location.hash)
	const scenarioRoleNames = isDefaultRoleNames(linkData.roleNames)
		? JSON.parse(sessionStorage.getItem("scenarioRoles") || '["Killer", "Private Eye", "Witness"]')
		: linkData.roleNames

	return urlManager.generateRolesFromNames(scenarioRoleNames)
}

function isDefaultRoleNames(roleNames: string[]): boolean {
	return roleNames[0] === "Killer" && roleNames[1] === "Private Eye" && roleNames[2] === "Witness"
}
