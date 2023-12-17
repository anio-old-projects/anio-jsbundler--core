import fs from "node:fs/promises"
import path from "node:path"
import convertFilePathToExportName from "./convertFilePathToExportName.mjs"
import emitWarning from "./emitWarning.mjs"
import stripSuffix from "./stripSuffix.mjs"
import colorize from "./colorize.mjs"

async function getExportedFunctionsRecursively(
	root, dir, ret = null
) {
	if (ret === null) ret = []

	const entries = await fs.readdir(
		path.join(root, dir)
	)

	for (const entry of entries) {
		const relative_path = path.join(dir, entry)
		const absolute_path = path.join(root, dir, entry)
		const stat = await fs.lstat(absolute_path)

		if (stat.isFile()) {
			ret.push(relative_path)
		} else if (stat.isDirectory()) {
			await getExportedFunctionsRecursively(root, relative_path, ret)
		}
	}

	return ret
}

export default async function(project) {
	let files = await getExportedFunctionsRecursively(
		path.join(project.root, "src", "export"), "."
	)

	files = files.filter(file => {
		const is_valid_source_file = file.endsWith(".mjs")

		if (!is_valid_source_file) {
			let msg = ``

			msg += `Ignoring unsupported file ${colorize(`src/export/${file}`, "yellow")}`

			msg += ` ; this file should be removed from the export folder.`

			emitWarning(msg)
		}

		return is_valid_source_file
	})

	const library_functions = files.map(file => {
		const type = file.endsWith("Factory.mjs") ? "factory" : "function"
		const export_name = convertFilePathToExportName(file)

		let tmp = {
			type,
			relative_path: file,
			export_name,
			// used for auto-generating functions
			autogen: {}
		}

		if (type === "function") {
			tmp.autogen.associated_factory = export_name + "Factory"
			tmp.autogen.virtual_path = stripSuffix(file, ".mjs") + "Factory.mjs"
		} else if (type === "factory") {
			tmp.autogen.associated_function = stripSuffix(export_name, "Factory")
			tmp.autogen.virtual_path = stripSuffix(file, "Factory.mjs") + ".mjs"
		}

		return tmp
	})

	const functionExists = (fn_name, type) => {
		for (const fn of library_functions) {
			if (fn.type !== type) continue

			if (fn.export_name === fn_name) return true
		}

		return false
	}

	/** check for exports that both have a factory and a function **/
	for (const library_function of library_functions) {
		if (library_function.type === "factory") {
			if (functionExists(library_function.autogen.associated_function, "function")) {
				let msg = `Both `

				msg += colorize(library_function.autogen.associated_function, "yellow")
				msg += ` and `
				msg += colorize(library_function.export_name, "yellow")
				msg += ` are defined. This is supported, but not recommended`
				msg += ` ; define either one but not both.`


				emitWarning(msg)
			}
		}
	}

	if (
		functionExists("importWithContext", "function") ||
		functionExists("importWithContextFactory", "factory")
	) {
		let msg = ``

		msg += `You cannot have an export named ${colorize("importWithContext", "yellow")} or ${colorize("importWithContextFactory", "yellow")}`
		msg += ` ; these exports will be ignored.`

		emitWarning(msg)
	}

	return library_functions.filter(library_function => {
		let ignore = false

		if (library_function.type === "factory") {
			if (library_function.export_name === "importWithContextFactory") {
				ignore = true
			}
		} else if (library_function.type === "function") {
			if (library_function.export_name === "importWithContext") {
				ignore = true
			}
		}

		if (ignore) {
			emitWarning(`I'm removing the exported function named ${colorize(library_function.export_name, "yellow")} from the list`)
		}

		return !ignore
	})
}
