import fs from "node:fs/promises"
import path from "node:path"
import convertFilePathToExportName from "./convertFilePathToExportName.mjs"
import autoGenerateWarningComment from "./autoGenerateWarningComment.mjs"

async function generateFactory(file, fn) {
	const source = path.join("..", "export", fn.source.path)

	await fs.writeFile(
		file, await autoGenerateWarningComment() + `
import ${fn.source.export_name}_impl from ${JSON.stringify(source)}

export default function ${fn.destination.export_name}(context) {
	return ${fn.source.export_name}_impl;
}
`
	)
}

async function generateFunction(file, fn) {
	const source = path.join("..", "export", fn.source.path)

	await fs.writeFile(
		file, await autoGenerateWarningComment() + `
import {createDefaultContextAsync} from "@anio-jsbundler/runtime"
import ${fn.source.export_name} from ${JSON.stringify(source)}

const ${fn.destination.export_name}_impl = ${fn.source.export_name}(
	await createDefaultContextAsync()
)

export default function ${fn.destination.export_name}(...args) {
	return ${fn.destination.export_name}_impl(...args)
}
`
	)
}

export default async function(project, functions) {
	let ret = []

	for (const fn of functions) {
		const dest_path = path.join(
			project.root, "src", "auto", fn.destination.path
		)

		if (fn.create === "function") {
			await generateFunction(dest_path, fn)
		} else if (fn.create === "factory") {
			await generateFactory(dest_path, fn)
		}

		process.stderr.write(
			`Auto generated function '${fn.destination.export_name}' for '${fn.source.export_name}'\n`
		)

		ret.push(fn.destination.path)
	}

	return ret
}
