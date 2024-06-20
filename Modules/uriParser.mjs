import Role from "./Classes/Role.mjs"



export default {
	ConcatenateComponents: function(components) {
		let uriComponents = ""

		for (let i = 0; i < components.length; i++) {
			const component = components[i]
			uriComponents += (i === 0 ? "?" : "&") + component
		}

		return uriComponents
	},

	SeparateComponents: function (uri) {
		const matchedComponents = [...uri.matchAll(/[\?&](\w+)=(\w+)/g)]
		const components = {}

		for (const component of matchedComponents) {
			const [, name, value] = component
			components[name] = value
		}

		return components
	},

	Roles: {
		Encode: function(roles) {
			let uriComponent = ""

			for (const role of roles) {
				uriComponent = uriComponent.concat(role.Name + "_")
			}

			uriComponent = uriComponent.slice(0, -1) // Trim trailing underscore

			return "roles=" + encodeURIComponent(uriComponent)
		},

		Decode: function (componentValue) {
			const roleNames = componentValue.split("_")
			const roles = []

			for (const roleName of roleNames) {
				roles.push(new Role(roleName, Role.getAlignmentFromRoleName(roleName)))
			}

			return roles
		},
	},

	ScenarioName: {
		Encode: function(scenarioName) {
			return "name=" + encodeURIComponent(scenarioName)
		},

		Decode: function (componentValue) {
			try {
				return decodeURIComponent(componentValue)
			} catch (error) {
				return "Error parsing scenario name: " + error
			}
		},
	}
}