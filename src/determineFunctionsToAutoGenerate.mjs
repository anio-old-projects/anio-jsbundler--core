import path from "node:path"

import {
	isRegularFile,
	emitInfo,
	colorize
} from "@anio-jsbundler/utilities"

export default async function(project, library_functions) {
	let autogenerate = []

	const factories = library_functions.map(fn => {
		return fn + "Factory"
	})

	for (const factory of factories) {
		const factory_path = path.join(
			project.root, "src", "export", factory
		) + ".mjs"

		if (!(await isRegularFile(factory_path))) {
			emitInfo(
				`Factory ${factory} does not exist, it will be created`, false
			)

			autogenerate.push(factory)
		}
	}

	for (const library_function of library_functions) {
		const function_path = path.join(
			project.root, "src", "export", library_function
		) + ".mjs"

		if (!(await isRegularFile(function_path))) {
			emitInfo(
				`Function ${library_function} does not exist, it will be created`, false
			)

			autogenerate.push(library_function)
		}
	}

	if (autogenerate.length) {
		emitInfo(``, false)
	}

	return autogenerate
}
