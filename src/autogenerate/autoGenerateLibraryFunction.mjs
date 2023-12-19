import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default function(fn) {
	const export_name = convertFilePathToExportName(fn)

	return `
import ${export_name}Factory from "../export/${fn}Factory.mjs"
import {createDefaultContextAsync} from "@anio-jsbundler/runtime"

const ${export_name}_impl = ${export_name}Factory(
	await createDefaultContextAsync()
)

export default function ${export_name}(...args) {
	return ${export_name}_impl(...args)
}
`
}
