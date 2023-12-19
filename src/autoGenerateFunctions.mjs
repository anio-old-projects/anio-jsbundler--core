import fs from "node:fs/promises"
import path from "node:path"

import {
	emitInfo,
	colorize,
	stripSuffix
} from "@anio-jsbundler/utilities"

import getAutoGenerateWarningComment from "./util/getAutoGenerateWarningComment.mjs"
import convertFilePathToExportName from "./util/convertFilePathToExportName.mjs"

import autoGenerateLibraryFunction from "./autogenerate/autoGenerateLibraryFunction.mjs"
import autoGenerateFactoryFunction from "./autogenerate/autoGenerateFactoryFunction.mjs"

export default async function(project, autogenerate) {
	for (const fn of autogenerate) {
		let source = await getAutoGenerateWarningComment()
		const fn_filename = convertFilePathToExportName(fn) + ".mjs"

		const fn_dest = path.join(
			project.root, "src", "auto", fn_filename
		)

		if (fn.endsWith("Factory")) {
			emitInfo(`Auto generating factory  ${colorize(fn, "blue")} -> ${colorize(`src/auto/${fn_filename}`, "blue")}`)

			source += autoGenerateFactoryFunction(stripSuffix(fn, "Factory"))
		} else {
			emitInfo(`Auto generating function ${colorize(fn, "blue")} -> ${colorize(`src/auto/${fn_filename}`, "blue")}`)

			source += autoGenerateLibraryFunction(fn)
		}

		await fs.writeFile(fn_dest, source)
	}
}
