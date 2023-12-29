import fs from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"

import {
	isRegularDirectorySync
} from "@anio-jsbundler/utilities/fs"

const __dirname = path.dirname(
	fileURLToPath(import.meta.url)
)

async function getListOfSupportFiles(type) {
	const ref_dir = path.resolve(
		__dirname, "support_files", `type_${type}`
	)

	const entries = await fs.readdir(ref_dir)

	return entries.filter(entry => {
		return entry.endsWith(".mjs")
	}).map(entry => {
		return {
			relative_path: entry,
			absolute_path: path.join(ref_dir, entry)
		}
	})
}

export default async function(project) {
	const dest_dir = path.join(project.root, "src", "auto", "util")
	const files = await getListOfSupportFiles(project.config.type)

	if (!isRegularDirectorySync(dest_dir)) {
		await fs.mkdir(dest_dir)
	}

	for (const file of files) {
		const dest = path.join(dest_dir, file.relative_path)

		await fs.writeFile(
			dest, await fs.readFile(file.absolute_path)
		)
	}
}
