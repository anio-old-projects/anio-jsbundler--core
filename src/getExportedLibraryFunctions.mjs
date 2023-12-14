import fs from "node:fs/promises"
import path from "node:path"
import convertFilePathToExportName from "./convertFilePathToExportName.mjs"
import stripSuffix from "./stripSuffix.mjs"

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

	return files.map(file => {
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
}
