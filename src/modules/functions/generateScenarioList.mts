import settings from "../settings.mts"
import type {Alignment, RoleData} from "../roles.mts"

const LIST_TITLE_PREFIX = "# "
const LIST_HEADING_PREFIX = "### "
const LIST_ITEM_PREFIX = "- "
const WIKI_URL_PREFIX = "https://massacards.miraheze.org/wiki/"

interface ListItem {
	name: string // "Bystander", "Any Innocent", "Bystander?"
	role: RoleData
	count: number
}

function formatWikiLink(pageName: string, text?: string) {
	return `[${text || pageName}](<${WIKI_URL_PREFIX + pageName.replaceAll(" ", "_")}>)`
}

function getListItemName(role: RoleData) {
	let itemName = ""

	if (role.isAlignmentRole) {
		itemName = settings.shareList.wikiLinks
			? `Any ${formatWikiLink(role.alignment + " Alignment", role.alignment)}`
			: `Any ${role.alignment}`

		if (role.alignment === "Unknown") {
			itemName = "Any role"
		}
	} else {
		itemName = settings.shareList.wikiLinks ? formatWikiLink(role.name) : role.name
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

		if (listItem && settings.shareList.groupDuplicates) {
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

		if (settings.shareList.groupDuplicates) break
	}

	if (listItem.count > 1 && settings.shareList.groupDuplicates) {
		output += ` [×${listItem.count}]`
	}

	return output
}

export default function generateScenarioList(name: string, link: string, roles: RoleData[]): string {
	let scenarioList = `${LIST_TITLE_PREFIX}[${name}](<${link}>)`
	const listItems = createListItems(roles)

	if (settings.shareList.alignmentHeadings) {
		const alignmentGroupedListItems: Partial<Record<Alignment, ListItem[]>> = {}

		listItems.forEach((listItem) => {
			const alignmentGroup = alignmentGroupedListItems[listItem.role.alignment]

			if (alignmentGroup) {
				alignmentGroup.push(listItem)
			} else {
				alignmentGroupedListItems[listItem.role.alignment] = [listItem]
			}
		})

		settings.sortOrders[settings.sortRoles.sortBy === "Lights out phase" ? "lightsOut" : "alignment"].forEach(
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
