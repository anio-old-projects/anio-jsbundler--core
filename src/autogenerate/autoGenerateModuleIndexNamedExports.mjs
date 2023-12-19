import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default async function({
	getSourceOfFunction,
	library_functions
}) {
	let ret = `\n/* Named Exports */\n`

	for (const fn of library_functions) {
		const ident = convertFilePathToExportName(fn)

		ret += `export const ${ident} = ${ident}_impl;\n`
		ret += `export const ${ident}Factory = ${ident}Factory_impl;\n`
	}

	return ret
}
