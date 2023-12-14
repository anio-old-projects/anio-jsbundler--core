import calcDirHash from "./calcDirHash.mjs"
import calcFileHash from "./calcFileHash.mjs"
import calcStringHash from "./calcStringHash.mjs"
import isRegularDirectory from "./isRegularDirectory.mjs"
import isRegularFile from "./isRegularFile.mjs"
import path from "node:path"

export default async function(project) {
	let hashes = []

	process.stderr.write(`Calculating hash of src/\n`)

	hashes = [...await calcDirHash(
		path.join(project.root, "src")
	)]

	// add anio_project.mjs and package.json of project
	// to hash
	// and bundle.resources folder (if it exists)
	if (await isRegularDirectory(
		path.join(project.root, "bundle.resources")
	)) {
		process.stderr.write(`Calculating hash of bundle.resources/\n`)

		hashes = [
			...hashes,
			await calcDirHash(
				path.join(project.root, "bundle.resources")
			)
		]
	}

	hashes = [
		...hashes,
		{
			path: "anio_project.mjs",
			hash: await calcFileHash(
				path.join(project.root, "anio_project.mjs")
			)
		}
	]

	if (await isRegularFile(path.join(project.root, "package.json"))) {
		process.stderr.write(`Calculating hash of package.json\n`)

		hashes = [
			...hashes,
			{
				path: "package.json",
				hash: await calcFileHash(
					path.join(project.root, "package.json")
				)
			}
		]
	}

	const hash = hashes.map(entry => {
		return entry.path + ":" + entry.hash
	}).join("\n")

	const bundle_id = await calcStringHash(hash)


	let short_bundle_id = bundle_id.slice(0, 8)

	short_bundle_id += "..."

	short_bundle_id += bundle_id.slice(
		bundle_id.length - 8
	)

	return {
		bundle_id,
		short_bundle_id
	}
}
