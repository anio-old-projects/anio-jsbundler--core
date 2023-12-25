import fs from "node:fs/promises"
import path from "node:path"
import getAutoGenerateWarningComment from "./util/getAutoGenerateWarningComment.mjs"

import {
	IdentifierGenerator,
	codegenerator
} from "@anio-jsbundler/utilities"

export default async function(project, library_functions) {
	let src = await getAutoGenerateWarningComment()

	const generator = new IdentifierGenerator()

	let grouped_import = [], default_export = []

	for (const fn of library_functions) {
		grouped_import.push({
			key: fn.canonical_name,
			value: generator.insert(fn.canonical_name)
		})

		grouped_import.push({
			key: fn.canonical_name + "Factory",
			value: generator.insert(fn.canonical_name + "Factory")
		})

		default_export.push({
			key: fn.canonical_path + ".mjs",
			value: generator.lookup(fn.canonical_name)
		})

		default_export.push({
			key: fn.canonical_path + "Factory.mjs",
			value: generator.lookup(fn.canonical_name + "Factory")
		})
	}

	src += "\n"
	src += codegenerator.groupedImport("./library.mjs", grouped_import, {
		additional_padding: 5
	})

	src += "\n\n"
	src += codegenerator.defaultExportObject(default_export)
	src += "\n"

	await fs.writeFile(
		path.join(project.root, "src", "auto", "dict.mjs"),
		src
	)
}
