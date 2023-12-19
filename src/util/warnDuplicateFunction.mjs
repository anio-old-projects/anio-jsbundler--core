import {
	colorize,
	stripSuffix,
	emitWarning
} from "@anio-jsbundler/utilities"

export default function(path1, path2) {
	let msg = `Both `

	msg += colorize(stripSuffix(path1, ".mjs"), "yellow")
	msg += ` and `
	msg += colorize(stripSuffix(path2, ".mjs"), "yellow")
	msg += ` are defined. This is supported, but not recommended`
	msg += ` ; define either one but not both.`

	emitWarning(msg)
}
