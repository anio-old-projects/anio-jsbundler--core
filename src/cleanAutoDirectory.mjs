import fs from "node:fs/promises"
import path from "node:path"

import {
	emitInfo,
	emitWarning,
	colorize,
	EmojiMessageGenerator
} from "@anio-jsbundler/utilities"

import {
	isRegularDirectorySync,
	removeDirectorySync
} from "@anio-jsbundler/utilities/fs"

export default async function(options, project, task) {
	const willAutoGenerateFile = (file_name) => {
		return task.files_to_generate.map(x => {
			return x.file
		}).includes(file_name)
	}

	const entries = await fs.readdir(
		path.resolve(project.root, "src", "auto")
	)

	let trash = new EmojiMessageGenerator("trash")
	let scrub = new EmojiMessageGenerator("soap")

	for (const entry of entries) {
		const absolute_path = path.resolve(
			project.root, "src", "auto", entry
		)

		if (!willAutoGenerateFile(entry)) {
			trash.emit("remove %", entry)
			//emitInfo(`  remove ${colorize(`src/auto/${entry}`, "blue")}`, false)

			/*if (isRegularDirectorySync(absolute_path)) {
				removeDirectorySync(absolute_path)
			} else {
				await fs.unlink(absolute_path)
			}*/
		} else {
			scrub.emit(`scrub %`, entry)

			await fs.writeFile(absolute_path, "aff")
		}
	}
}
