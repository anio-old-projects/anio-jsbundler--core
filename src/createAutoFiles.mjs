import generateModuleLibrary from "./generateModuleLibrary.mjs"
import generateModuleIndex from "./generateModuleIndex.mjs"
import generateModuleDictionary from "./generateModuleDictionary.mjs"
import generateImportWithContextAsyncFn from "./generateImportWithContextAsyncFn.mjs"

import {
	emitInfo,
	colorize
} from "@anio-jsbundler/utilities"

export default async function(options, project, task) {
	if (options.no_auto_files) {
		emitInfo("Skipping creation of auto files.")

		return
	}

	if (project.config.type === "lib") {
		for (const {file, context} of task.files_to_generate) {
			const {library_functions} = context

			emitInfo("⚙️  generate " + colorize(`src/auto/${file}`, "blue"), false)

			switch (file) {
				case "library.mjs": {
					await generateModuleLibrary(project, library_functions)
				} break

				case "index.mjs": {
					await generateModuleIndex(project, library_functions)
				} break

				case "dict.mjs": {
					await generateModuleDictionary(project, library_functions)
				} break

				case "importWithContextAsync.mjs": {
					await generateImportWithContextAsyncFn(project, library_functions)
				} break
			}
		}
	}
}
