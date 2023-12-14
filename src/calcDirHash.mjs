import calcFileHash from "./calcFileHash.mjs"
import fs from "node:fs/promises"
import path from "node:path"

async function collectHashes(root, dir, ret = null) {
	if (ret === null) ret = []

	const entries = await fs.readdir(
		path.resolve(root, dir)
	)

	for (const entry of entries) {
		const absolute_path = path.resolve(root, dir, entry)
		const relative_path = path.join(dir, entry)

		const stat = await fs.lstat(absolute_path)

		if (stat.isDirectory()) {
			await collectHashes(root, relative_path, ret)
		} else if (stat.isFile()) {
			ret.push({
				hash: await calcFileHash(absolute_path),
				path: relative_path
			})
		}
	}

	return ret
}

export default async function(dir) {
	const hashes = await collectHashes(dir, ".")

	// sort hashes for stable output
	hashes.sort((a, b) => {
		return a.path.localeCompare(b.path)
	})

	return hashes
}
