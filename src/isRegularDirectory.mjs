import fs from "node:fs/promises"

export default async function(path) {
	try {
		const stat = await fs.lstat(path)

		return stat.isDirectory() && !stat.isSymbolicLink()
	} catch {
		return false
	}
}
