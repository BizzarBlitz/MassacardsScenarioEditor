import {reactive} from "vue"

export default reactive({
	scenario: {
		gamemode: undefined as string | undefined, // Same as normal
		guestNumberCards: undefined as boolean | undefined,
	},
	addRole: {
		addedRole: "Bystander" as "Bystander" | "Any role" | "Random role" | "Last role duplicate",
		fillRequiredRoles: true,
	},
	sortRoles: {
		autosortRoles: false,
		sortBy: "Alignment" as "Alignment" | "Lights out phase" | "Name",
		isolateRequiredRoles: true,
		prioritizeSuperRoles: true,
	},
	randomizeRoles: {
		allowDuplicates: false,
		maintainAlignments: true,
		preserveRequiredRoles: true,
		allowReplaceableSuperRoles: false,
	},
})
