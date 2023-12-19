import path from "node:path"

import getJavaScriptFilesRecursively from "./util/getJavaScriptFilesRecursively.mjs"
import warnDuplicateFunction from "./util/warnDuplicateFunction.mjs"
import filterReservedNames from "./util/filterReservedNames.mjs"

import {
	stripSuffix,
	emitInfo,
	colorize
} from "@anio-jsbundler/utilities"

export default async function(project) {
	let javascript_files = await getJavaScriptFilesRecursively(
		path.resolve(project.root, "src", "export"), "."
	)

	let functions = []
	let duplicate_functions = {}

	for (const javascript_file of javascript_files) {
		if (javascript_file.endsWith("Factory.mjs")) {
			const counterpart = stripSuffix(
				javascript_file, "Factory.mjs"
			) + ".mjs"

			if (functions.includes(counterpart)) {
				warnDuplicateFunction(javascript_file, counterpart)

				duplicate_functions[counterpart] = true
			} else {
				functions.push(counterpart)
			}
		} else {
			functions.push(javascript_file)
		}
	}

	functions = functions.map(fn => {
		return stripSuffix(fn, ".mjs")
	})

	functions = filterReservedNames(functions)

	emitInfo(`I found ${colorize(functions.length, "blue")} library functions: `)
	emitInfo(``, false)

	for (const fn of functions) {
		let duplicate_info = ""

		if (`${fn}.mjs` in duplicate_functions) {
			duplicate_info = colorize(" (⚠️  user defined function and factory)", "yellow")
		}

		emitInfo(`    - ${colorize(fn, "blue")}${duplicate_info}`, false)
	}

	emitInfo(``, false)

	return functions
}
