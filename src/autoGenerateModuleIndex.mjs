import path from "node:path"
import fs from "node:fs/promises"

import convertFilePathToExportName from "./util/convertFilePathToExportName.mjs"
import getAutoGenerateWarningComment from "./util/getAutoGenerateWarningComment.mjs"
import sortAlphabetically from "./util/sortAlphabetically.mjs"

import {
	isRegularFile
} from "@anio-jsbundler/utilities"

import autoGenerateModuleIndexImports from "./autogenerate/autoGenerateModuleIndexImports.mjs"
import autoGenerateModuleIndexNamedExports from "./autogenerate/autoGenerateModuleIndexNamedExports.mjs"
import autoGenerateModuleIndexDict from "./autogenerate/autoGenerateModuleIndexDict.mjs"
import autoGenerateModuleIndexImportWithContextFunction from "./autogenerate/autoGenerateModuleIndexImportWithContextFunction.mjs"
import autoGenerateModuleIndexDefaultExport from "./autogenerate/autoGenerateModuleIndexDefaultExport.mjs"

async function _getSourceOfFunction(project, fn) {
	const auto_path = path.resolve(
		project.root, "src", "auto", convertFilePathToExportName(fn) + ".mjs"
	)

	if (await isRegularFile(auto_path)) {
		return `src/auto/${convertFilePathToExportName(fn)}.mjs`
	}

	return `src/export/${fn}.mjs`
}

export default async function(project, library_functions) {
	// Make sure output order is stable!
	library_functions.sort(sortAlphabetically)

	const context = {
		async getSourceOfFunction(fn) {
			return await _getSourceOfFunction(project, fn)
		},

		library_functions
	}

	let module_index = await getAutoGenerateWarningComment()

	module_index += await autoGenerateModuleIndexImports(context)
	module_index += await autoGenerateModuleIndexNamedExports(context)
	module_index += await autoGenerateModuleIndexDict(context)
	module_index += await autoGenerateModuleIndexImportWithContextFunction(context)
	module_index += await autoGenerateModuleIndexDefaultExport(context)

	await fs.writeFile(
		path.join(project.root, "src", "auto", "_index.mjs"),
		module_index
	)
}
