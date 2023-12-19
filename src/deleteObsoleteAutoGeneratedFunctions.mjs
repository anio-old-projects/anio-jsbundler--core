import path from "node:path"
import fs from "node:fs/promises"
import convertFilePathToExportName from "./util/convertFilePathToExportName.mjs"

import {
	emitInfo,
	colorize
} from "@anio-jsbundler/utilities"

export default async function(project, autogenerate) {
	let n_deleted = 0

	autogenerate = autogenerate.map(convertFilePathToExportName).map(fn => {
		return `${fn}.mjs`
	})

	const entries = await fs.readdir(
		path.resolve(project.root, "src", "auto")
	)

	for (const entry of entries) {
		if (entry === "_index.mjs") continue

		if (!autogenerate.includes(entry)) {
			emitInfo(`Deleting ${colorize(entry, "blue")}`)

			await fs.unlink(
				path.resolve(project.root, "src", "auto", entry)
			)

			++n_deleted
		}
	}

	if (n_deleted === 0) {
		emitInfo(`src/auto is clean`)
	}
}
