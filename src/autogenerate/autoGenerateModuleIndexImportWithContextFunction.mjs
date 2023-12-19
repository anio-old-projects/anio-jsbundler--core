import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default async function({
	getSourceOfFunction,
	library_functions
}) {
	let ret = `\n/* importWithContext Function */\n`

	ret += `\nexport function importWithContext(context) {\n`
	// maybe add context chain in here?
	ret += `    let library = {}\n\n`

	for (const fn of library_functions) {
		const ident = convertFilePathToExportName(fn)

		ret += `    library[${JSON.stringify(ident)}] = ${ident}Factory_impl(context)\n`
		ret += `    library[${JSON.stringify(ident + "Factory")}] = ${ident}Factory_impl\n`
	}

	ret += `\n    library.dict = {}\n`

	for (const fn of library_functions) {
		const ident = convertFilePathToExportName(fn)

		ret += `    library.dict[${JSON.stringify(fn + ".mjs")}] = library[${JSON.stringify(ident)}]\n`
		ret += `    library.dict[${JSON.stringify(fn + "Factory.mjs")}] = library[${JSON.stringify(ident + "Factory")}]\n`
	}

	ret += `\n`
	ret += `    library.importWithContext        = importWithContext\n`
	ret += `    library.importWithContextFactory = importWithContextFactory\n`

	ret += `\n`

	ret += `    return library\n`

	ret += `}\n`
	ret += `\n`

	ret += `export function importWithContextFactory(context) {\n`
	ret += `    return importWithContext\n`
	ret += `}\n`

	return ret
}

