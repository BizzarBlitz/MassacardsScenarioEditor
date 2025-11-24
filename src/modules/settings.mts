import {reactive} from "vue"
import type {Alignment} from "./roles.mts"

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
	shareScreenshot: {
		showAlignments: false,
	},
	shareList: {
		wikiLinks: true,
		alignmentHeadings: true,
		groupDuplicates: true,
	},

	// Technically not a setting (yet)
	sortOrders: {
		lightsOut: [
			"Murderous",
			"Dark Innocent",
			"Neutral",
			"Undead",
			"Hungry",
			"None",
			"Innocent",
			"True Neutral",
			"Unknown",
		] as Alignment[],
		alignment: [
			"Murderous",
			"Dark Innocent",
			"Innocent",
			"Neutral",
			"True Neutral",
			"None",
			"Undead",
			"Hungry",
			"Unknown",
		] as Alignment[],
	},
})
