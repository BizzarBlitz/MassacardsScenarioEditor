// @ts-check
// Would really like to use actual TS for this... oh well

// Constants

const PLACEHOLDER_IMAGE = "https://static.miraheze.org/massacardswiki/4/47/Placeholder.png"

// Variables
const roleContainer = document.getElementsByClassName("role-container")[0]
const role = getRole()


// Functions

async function getRole() {
	// TODO: Return from promises? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
	const fetchPromise = new Promise(async (resolve) => {
		const responseString = await fetch("Prefabs/Role/role.html").then((response) => (response.text()))
		resolve(new DOMParser().parseFromString(responseString, "text/html"))
	}).catch((reason) => {
		console.log("Failed to fetch role.html (report bug pls)", reason)
	})

	const doc = await fetchPromise
	const role = doc.getElementById("role")

	return role
}

async function createRole(name, alignment) {
	const newRole = (await role).cloneNode(true)

	const roleStruct = {
		Role: newRole,
		RoleName: newRole.getElementsByClassName("role-name")[0],
		RoleImage: newRole.getElementsByClassName("role-image")[0],
		RoleButtons: newRole.getElementsByClassName("role-button"),

		Name: name,
		Alignment: alignment,
	}

	roleStruct.RoleName.value = name
	roleStruct.RoleImage.src = `Files/Roles/${name}.png`
	roleStruct.RoleImage.alt = name

	return roleStruct
}

async function createDefaultRoles() {
	const killer = await createRole("Killer", "Murderous")
	const privateEye = await createRole("Private Eye", "Dark Innocent")
	const witness = await createRole("Witness", "Innocent")

	roleContainer.appendChild(killer.Role)
	roleContainer.appendChild(privateEye.Role)
	roleContainer.appendChild(witness.Role)
}

function connectRole() {
	
}



createDefaultRoles()