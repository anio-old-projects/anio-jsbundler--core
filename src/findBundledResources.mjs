import fs from "node:fs/promises"
import path from "node:path"

import {
	isRegularDirectory,
	emitInfo
} from "@anio-jsbundler/utilities"

async function collectResources(root, dir, ret = null) {
	if (ret === null) ret = []

	const entries = await fs.readdir(
		path.join(root, dir)
	)

	for (const entry of entries) {
		const relative_path = path.join(dir, entry)
		const absolute_path = path.join(root, dir, entry)
		const stat = await fs.lstat(absolute_path)

		if (stat.isDirectory()) {
			await collectResources(root, relative_path, ret)
		} else if (stat.isFile()) {
			ret.push({
				relative_path,
				absolute_path
			})
		}
	}

	return ret
}

export default async function(project) {
	let resources = {}

	const resources_path = path.join(
		project.root, "bundle.resources"
	)

	if (!(await isRegularDirectory(resources_path))) {
		emitInfo(`Skipping bundle.resources (not found)`)

		return {}
	}

	const files = await collectResources(resources_path, ".")

	for (const file of files) {
		resources[file.relative_path] = (await fs.readFile(
			file.absolute_path
		)).toString()
	}

	return resources
}
