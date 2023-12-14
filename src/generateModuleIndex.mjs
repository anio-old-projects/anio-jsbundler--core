import path from "node:path"
import _generateSourceCodeForModuleIndex from "./_generateSourceCodeForModuleIndex.mjs"

function sortAlphabetically(a, b) {
	return a.localeCompare(b)
}

export default async function(project, {library_functions, auto_gen}) {
	let file_imports = [], file_exports = [], export_dict = []

	for (const fn of library_functions) {
		file_imports.push({
			identifier: fn.export_name + "_impl",
			path: path.join("..", "export", fn.relative_path)
		})

		file_exports.push({
			export_name: fn.export_name,
			source: fn.export_name + "_impl"
		})

		export_dict.push({
			key: fn.relative_path,
			value: fn.export_name + "_impl"
		})
	}

	for (const fn of auto_gen) {
		file_imports.push({
			identifier: fn.destination.export_name + "_auto_impl",
			path: fn.destination.path
		})

		file_exports.push({
			export_name: fn.destination.export_name,
			source: fn.destination.export_name + "_auto_impl"
		})

		export_dict.push({
			key: fn.destination.virtual_path,
			value: fn.destination.export_name + "_auto_impl"
		})
	}

	/* Make sure output order is stable */
	file_imports.sort((a, b) => {
		return sortAlphabetically(a.identifier, b.identifier)
	})

	file_exports.sort((a, b) => {
		return sortAlphabetically(a.export_name, b.export_name)
	})

	export_dict.sort((a, b) => {
		return sortAlphabetically(a.key, b.key)
	})

	/* Generate the file */
	await _generateSourceCodeForModuleIndex(project, {
		file_imports,
		file_exports,
		export_dict
	})

	process.stderr.write(
		`Auto generated module index.mjs file (${file_exports.length} exports)\n`
	)
}
