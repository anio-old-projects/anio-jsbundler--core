import path from "node:path"
import fs from "node:fs/promises"
import getAutoGenerateWarningComment from "./util/getAutoGenerateWarningComment.mjs"

import {
	IdentifierGenerator
} from "@anio-jsbundler/utilities"

import {
	objectLiteral,
	groupedImport
} from "@anio-jsbundler/utilities/codegenerator"

export default async function(project, library_functions) {
	let src = await getAutoGenerateWarningComment()

	const generator = new IdentifierGenerator()

	let grouped_import = [], library_literal = [], library_literal2 = []

	for (const fn of library_functions) {
		grouped_import.push({
			key: `${fn.canonical_name}Factory`,
			value: `${fn.canonical_name}Factory` //generator.insert(fn.canonical_name + "Factory")
		})

		library_literal.push({
			key: `${fn.canonical_name}`,
			value: "await " + fn.canonical_name + "Factory" + "(null, library_context)"
		})

		library_literal.push({
			key: `${fn.canonical_name}Factory`,
			value: `${fn.canonical_name}Factory`//generator.lookup(fn.canonical_name + "Factory")
		})

		library_literal2.push({
			key: `${fn.canonical_path}.mjs`,
			value: `library[${JSON.stringify(fn.canonical_name)}]`
		})

		library_literal2.push({
			key: `${fn.canonical_path}Factory.mjs`,
			value: `library[${JSON.stringify(fn.canonical_name + "Factory")}]`
		})
	}

	let lib = objectLiteral(library_literal, {
		pre_padding: 8,
		additional_padding: 6
	})

	let dict = objectLiteral(library_literal2, {
		pre_padding: 8
	})

	src += "\n"

	src += `import {createDefaultContextAsync} from "@anio-jsbundler/runtime"\n`

	src += groupedImport("./library.mjs", grouped_import, {
		additional_padding: 9
	})

	src += "\n\n"

	// rename to importWithContextAsync

	// if new_context is not null use that instead of
	// merging with createDefaultContextAsync()

	src += "export default async function importWithContextAsync(plugs = {}, new_context = null) {\n"

	src += `    let library_context = new_context\n\n`

	src += `    /* Context is created here so every function has the same context */\n`
	src += `    if (library_context === null) {\n`
	src += `        library_context = await createDefaultContextAsync()\n`
	src += `    }\n\n`

	src += `    /* Plugs are set here so every function has the same context */\n`

	src += `    for (const key in plugs) {\n`
	src += `        library_context.plugs[key] = plugs[key];\n`
	src += `    }\n\n`

	src += `    let library = ${lib};\n`

	src += `\n    library.dict = ${dict};\n`
	src += `\n    library.importWithContextAsync = importWithContextAsync;\n`
	src += `    library.getUsedDefaultContext = function getUsedDefaultContext() { return library_context; };\n`
	src += `\n    return library;\n`
	src += "}\n"

	await fs.writeFile(
		path.join(project.root, "src", "auto", "importWithContextAsync.mjs"),
		src
	)
}
