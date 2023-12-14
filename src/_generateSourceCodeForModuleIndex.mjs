import autoGenerateWarningComment from "./autoGenerateWarningComment.mjs"
import fs from "node:fs/promises"
import path from "node:path"

function stringifyExportDict(dict) {
	let str = `const __export_dict = {\n`

	for (const entry of dict) {
		str += `    ${JSON.stringify(entry.key)}: ${entry.value},\n`
	}

	// remove trailing comma
	if (dict.length) {
		str = str.slice(0, str.length - 2) + "\n"
	}

	str += `}\n`

	return str
}

function createDefaultExport(file_exports) {
	let str = `export default {\n`

	for (const file_export of file_exports) {
		str += `    ${file_export.export_name},\n`
	}

	str += `    dict\n`

	str += `}\n`

	return str
}

export default async function(project, {
	file_imports,
	file_exports,
	export_dict
}) {
	let index = await autoGenerateWarningComment() + "\n"

	for (const file_import of file_imports) {
		let p = file_import.path

		if (!p.startsWith(".")) p = `./${p}`

		index += `import ${file_import.identifier} from ${JSON.stringify(p)}\n`
	}

	index += `\n/* Named Exports */\n`

	for (const file_export of file_exports) {
		index += `export const ${file_export.export_name} = ${file_export.source};\n`
	}

	index += `\n/* Export Dictionary */\n`

	index += stringifyExportDict(export_dict)

	index += `\nexport const dict = __export_dict;\n`

	index += `\n/* Default Export */\n`

	index += createDefaultExport(file_exports)

	await fs.writeFile(
		path.join(project.root, "src", "auto", "_index.mjs"), index
	)
}
