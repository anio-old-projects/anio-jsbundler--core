import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default async function({
	getSourceOfFunction,
	library_functions
}) {
	let ret = `\n/* Default Export */\n`

	ret += `export default {\n`

	for (const fn of library_functions) {
		const ident = convertFilePathToExportName(fn)

		ret += `    ${ident},\n`
		ret += `    ${ident}Factory,\n`
	}

	ret += `    importWithContext,\n`
	ret += `    importWithContextFactory,\n`
	ret += `    dict\n`

	ret += `}\n`

	return ret
}
