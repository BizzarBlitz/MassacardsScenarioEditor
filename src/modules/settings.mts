import {reactive, watch} from "vue"
import type {Alignment} from "./roles.mts"
import type {CustomRole} from "../components/CustomRoleItem.vue"

let defaultSettings = {
	scenario: {
		name: "Unnamed scenario",
		gamemodes: [] as string[],
		guestNumberCards: undefined as boolean | undefined,
	},
	controls: {
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
	},
	share: {
		shareScreenshot: {
			showAlignments: true,
		},
		shareList: {
			wikiLinks: true,
			alignmentHeadings: true,
			groupDuplicates: true,
		},
	},

	// Top left settings menu
	userSettings: {
		customRoles: [] as CustomRole[],
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
}

const savedSettings: {[K in keyof typeof defaultSettings]?: Storage} = {
	userSettings: localStorage,
	scenario: sessionStorage,
	controls: localStorage,
	share: localStorage,
}

function applySettingGroup(name: keyof typeof defaultSettings, storage: Storage) {
	const settingGroup = storage.getItem(name)
	if (!settingGroup || settingGroup === "") return

	const defaultSettingGroup: any = defaultSettings[name]

	try {
		const storedSettings = JSON.parse(settingGroup)
		for (const [key, value] of Object.entries(storedSettings)) {
			if (
				key in defaultSettingGroup &&
				(typeof defaultSettingGroup[key] === typeof value || defaultSettingGroup[key] === undefined)
			) {
				defaultSettingGroup[key] = value
			}
		}
	} catch (error) {
		console.error(error)
	}
}

for (const [settingGroup, storage] of Object.entries(savedSettings)) {
	applySettingGroup(settingGroup as keyof typeof savedSettings, storage)
}

const settings = reactive(defaultSettings)
export default settings

watch(settings, (newSettings) => {
	for (const [settingGroup, storage] of Object.entries(savedSettings)) {
		storage.setItem(settingGroup, JSON.stringify(newSettings[settingGroup as keyof typeof savedSettings]))
	}
})
