import settings from "../settings.mts"
import type {Alignment, RoleData} from "../roles.mts"
import roles from "../roles.mts"

const LIST_TITLE_PREFIX = "# "
const LIST_HEADING_PREFIX = "### "
const LIST_ITEM_PREFIX = "- "
const WIKI_URL_PREFIX = "https://massacards.miraheze.org/wiki/"

interface ListItem {
	name: string // "Bystander", "Any Innocent", "Bystander?"
	role: RoleData
	count: number
}

function formatWikiLink(url: string, text: string) {
	if (url === "") {
		return text
	} else {
		return `[${text}](<${url}>)`
	}
}

function getListItemName(role: RoleData) {
	let itemName = ""

	if (role.isAlignmentRole) {
		itemName = settings.share.shareList.wikiLinks
			? `Any ${formatWikiLink(WIKI_URL_PREFIX + role.alignment + "_Alignment", role.alignment)}`
			: `Any ${role.alignment}`

		if (role.alignment === "Unknown") {
			itemName = "Any role"
		}
	} else {
		itemName = settings.share.shareList.wikiLinks ? formatWikiLink(roles.getRoleLink(role.name), role.name) : role.name
		if (roles.isCustomRole(role.name)) {
			itemName += "\\*"
		}
	}

	if (role.optional) {
		itemName = `*${itemName}?*`
	}

	return itemName
}

function findRoleInList(listItems: ListItem[], role: RoleData) {
	for (let index = 0; index < listItems.length; index++) {
		const listItem = listItems[index]

		if (listItem.name === getListItemName(role)) {
			return listItem
		}
	}
}

function createListItems(roles: RoleData[]) {
	const listItems: ListItem[] = []

	roles.forEach((role) => {
		const listItem = findRoleInList(listItems, role)

		if (listItem && settings.share.shareList.groupDuplicates) {
			listItem.count++
			return
		}

		listItems.push({
			name: getListItemName(role),
			role: role,
			count: 1,
		})
	})

	return listItems
}

function getStringFromListItem(listItem: ListItem) {
	let output = ""

	for (let index = 0; index < listItem.count; index++) {
		output += "\n" + LIST_ITEM_PREFIX + listItem.name

		if (settings.share.shareList.groupDuplicates) break
	}

	if (listItem.count > 1 && settings.share.shareList.groupDuplicates) {
		output += ` [×${listItem.count}]`
	}

	return output
}

export default function generateScenarioList(name: string, link: string, scenarioRoles: RoleData[]): string {
	let scenarioList = `${LIST_TITLE_PREFIX}[${name}](<${link}>)`

	if (settings.scenario.gamemodes.length > 0) {
		scenarioList += "\n-# " + (settings.scenario.gamemodes.length === 1 ? "Gamemode: " : "Gamemodes: ")
		settings.scenario.gamemodes.forEach((gamemode, index) => {
			scenarioList +=
				formatWikiLink(WIKI_URL_PREFIX + "Gamemode#" + gamemode, gamemode) +
				(index < settings.scenario.gamemodes.length - 1 ? ", " : "")
		})
	}

	if (settings.scenario.guestNumberCards !== undefined) {
		scenarioList += "\n-# Guest Number Cards " + (settings.scenario.guestNumberCards ? "required" : "prohibited")
	}

	if (scenarioRoles.find((role) => roles.isCustomRole(role.name))) {
		scenarioList += "\n-# \\* Custom roles in use"
	}

	const listItems = createListItems(scenarioRoles)

	if (settings.share.shareList.alignmentHeadings) {
		const alignmentGroupedListItems: Partial<Record<Alignment, ListItem[]>> = {}

		listItems.forEach((listItem) => {
			const alignmentGroup = alignmentGroupedListItems[listItem.role.alignment]

			if (alignmentGroup) {
				alignmentGroup.push(listItem)
			} else {
				alignmentGroupedListItems[listItem.role.alignment] = [listItem]
			}
		})

		settings.sortOrders[settings.controls.sortRoles.sortBy === "Lights out phase" ? "lightsOut" : "alignment"].forEach(
			(alignment) => {
				const alignmentGroup = alignmentGroupedListItems[alignment]
				if (!alignmentGroup) return

				scenarioList += "\n" + LIST_HEADING_PREFIX + alignment
				alignmentGroup.forEach((listItem) => {
					scenarioList += getStringFromListItem(listItem)
				})
			},
		)
	} else {
		listItems.forEach((listItem) => {
			scenarioList += getStringFromListItem(listItem)
		})
	}

	return scenarioList
}
