import path from "node:path"

import getJavaScriptFilesRecursively from "./util/getJavaScriptFilesRecursively.mjs"
import warnDuplicateFunction from "./util/warnDuplicateFunction.mjs"
import filterReservedNames from "./util/filterReservedNames.mjs"
import convertFilePathToExportName from "./util/convertFilePathToExportName.mjs"

import {
	stripSuffix
} from "@anio-jsbundler/utilities"

import {
	isRegularFileSync
} from "@anio-jsbundler/utilities/fs"

export default async function(project) {
	let javascript_files = await getJavaScriptFilesRecursively(
		path.resolve(project.root, "src", "export"), "."
	)

	let entries = [], index = {}

	for (const javascript_file of javascript_files) {
		let canonical_path = javascript_file

		if (canonical_path.endsWith("Factory.mjs")) {
			canonical_path = stripSuffix(canonical_path, "Factory.mjs")
		} else {
			canonical_path = stripSuffix(canonical_path, ".mjs")
		}

		// if both function and factory are specified
		// index will contain canonical_path
		if (!(canonical_path in index)) {
			entries.push({
				canonical_path,
				canonical_name: convertFilePathToExportName(canonical_path)
			})

			// save index to disable autogeneration
			// (because both function and factory exist already)
			index[canonical_path] = entries.length - 1
		} else {
			const entry_index = index[canonical_path]

			entries[entry_index].autogen = null

			warnDuplicateFunction(
				`${canonical_path}.mjs`,
				`${canonical_path}Factory.mjs`,
			)
		}
	}

	let library = []

	for (const entry of entries) {
		if (entry.autogen === null) {
			library.push({...entry})

			continue
		}

		const factory_path = `${project.root}/src/export/${entry.canonical_path}Factory.mjs`

		const factory_exists = isRegularFileSync(factory_path)

		library.push({
			...entry,
			autogen: factory_exists ? "function" : "factory"
		})
	}

	return filterReservedNames(library)
}
