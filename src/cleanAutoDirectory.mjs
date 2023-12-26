import fs from "node:fs/promises"
import path from "node:path"

import {
	emitInfo,
	emitWarning,
	colorize,
	isRegularDirectory
} from "@anio-jsbundler/utilities"

export default async function(project) {
	// todo: consult project.config.type for project type
	const overwrite_if_exists = [
		"dict.mjs",
		"importWithContextAsync.mjs",
		"index.mjs",
		"library.mjs",
		"wrapFactory.mjs"
	]

	const entries = await fs.readdir(
		path.resolve(project.root, "src", "auto")
	)

	let n_wiped = 0

	for (const entry of entries) {
		const absolute_path = path.resolve(
			project.root, "src", "auto", entry
		)

		if (overwrite_if_exists.includes(entry)) {
			n_wiped++

			await fs.writeFile(absolute_path, "/* If this comment is visible an error occurred during bundling */\n")
		} else if (await isRegularDirectory(absolute_path)) {
			emitWarning(`src/auto folder may not contain folder ${colorize(entry, "yellow")}`)
		} else {
			emitInfo(`Removing ${colorize(entry, "blue")}`)

			await fs.unlink(absolute_path)
		}
	}

	emitInfo(`Truncated ${colorize(n_wiped, "blue")} auto generated files`)
}
