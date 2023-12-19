import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default async function({
	getSourceOfFunction,
	library_functions
}) {
	let ret = `\n/* Dictionary Export */\n`

	ret += `const dict = {\n`

	for (const fn of library_functions) {
		const ident = convertFilePathToExportName(fn)

		ret += `    ${JSON.stringify(fn + ".mjs")}: ${ident}_impl,\n`
		ret += `    ${JSON.stringify(fn + "Factory.mjs")}: ${ident}Factory_impl,\n`
	}

	ret += `}\n`

	return ret
}

