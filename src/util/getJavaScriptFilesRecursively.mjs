import path from "node:path"
import fs from "node:fs/promises"
import warnUnsupportedFile from "./warnUnsupportedFile.mjs"

export default async function getJavaScriptFilesRecursively(
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
			if (relative_path.endsWith(".mjs")) {
				ret.push(relative_path)
			} else {
				warnUnsupportedFile(relative_path)
			}
		} else if (stat.isDirectory()) {
			await getJavaScriptFilesRecursively(root, relative_path, ret)
		}
	}

	return ret
}
