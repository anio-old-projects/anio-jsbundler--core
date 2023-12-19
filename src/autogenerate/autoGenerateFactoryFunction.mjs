import convertFilePathToExportName from "../util/convertFilePathToExportName.mjs"

export default function(fn) {
	const export_name = convertFilePathToExportName(fn)

	return `
import ${export_name}_impl from "../export/${fn}.mjs"

export default function ${export_name}Factory(context) {
	return ${export_name}_impl
}
`
}
