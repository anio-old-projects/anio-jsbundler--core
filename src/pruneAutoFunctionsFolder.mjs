import fs from "node:fs/promises"
import path from "node:path"

export default async function(project, auto_generated_files) {
	let pruned_files = 0

	const auto_files = await fs.readdir(
		path.resolve(project.root, "src", "auto")
	)

	for (const auto_file of auto_files) {
		if (auto_generated_files.includes(auto_file)) {
			continue
		}
		// never delete auto generate _index.mjs file
		else if (auto_file === "_index.mjs") {
			continue
		}

		process.stderr.write(
			`Removing old auto function file '${auto_file}'\n`
		)

		await fs.unlink(
			path.resolve(project.root, "src", "auto", auto_file)
		)

		++pruned_files
	}

	if (pruned_files === 0) {
		process.stderr.write(`src/auto is clean\n`)
	}
}
