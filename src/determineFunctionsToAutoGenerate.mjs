import stripSuffix from "./stripSuffix.mjs"
import convertFilePathToExportName from "./convertFilePathToExportName.mjs"

function checkIfEntryExists(library_functions, entry) {
	for (const library_function of library_functions) {
		if (library_function.type !== entry.type) continue

		if (library_function.export_name === entry.name) {
			return true
		}
	}

	return false
}

function mapToAutogen(type, entry) {
	return {
		create: type,
		source: {
			export_name: entry.export_name,
			path: entry.relative_path
		},
		destination: {
			export_name: entry.autogen[`associated_${type}`],
			path: convertFilePathToExportName(entry.autogen.virtual_path) + ".mjs",
			virtual_path: entry.autogen.virtual_path
		}
	}
}

function determineFactoriesToGenerate(library_functions) {
	let ret = []

	for (const library_function of library_functions) {
		// only consider functions
		if (library_function.type !== "function") continue

		// does a factory for this function exist?
		const auto_gen_factory = !checkIfEntryExists(
			library_functions, {
				type: "factory",
				name: `${library_function.export_name}Factory`
			}
		)

		if (auto_gen_factory) {
			ret.push(mapToAutogen("factory", library_function))
		}
	}

	return ret
}

function determineFunctionsToGenerate(library_functions) {
	let ret = []

	for (const library_function of library_functions) {
		// only consider factories
		if (library_function.type !== "factory") continue

		// does a function exist for this factory?
		const auto_gen_function = !checkIfEntryExists(
			library_functions, {
				type: "function",
				name:stripSuffix(library_function.export_name, "Factory")
			}
		)

		if (auto_gen_function) {
			ret.push(mapToAutogen("function", library_function))
		}
	}

	return ret
}

export default function(library_functions) {
	const factories = determineFactoriesToGenerate(library_functions)
	const functions = determineFunctionsToGenerate(library_functions)

	return [...factories, ...functions]
}
