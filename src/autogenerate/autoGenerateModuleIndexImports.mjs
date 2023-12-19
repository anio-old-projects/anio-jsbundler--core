import path from "node:path"
import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default async function({
	getSourceOfFunction,
	library_functions
}) {
	let ret = ``

	for (const fn of library_functions) {
		const fn_source_path = await getSourceOfFunction(fn)
		const fn_source = path.relative("src/auto", fn_source_path)
		const fn_ident = convertFilePathToExportName(fn)

		const fn_factory_source_path = await getSourceOfFunction(`${fn}Factory`)
		const fn_factory_source = path.relative("src/auto", fn_factory_source_path)
		const fn_factory_ident = convertFilePathToExportName(`${fn}Factory`)

		ret += `import ${fn_ident}_impl from "./${fn_source}"\n`
		ret += `import ${fn_factory_ident}_impl from "./${fn_factory_source}"\n`
		//ret += `\n`
	}

	return ret
}
