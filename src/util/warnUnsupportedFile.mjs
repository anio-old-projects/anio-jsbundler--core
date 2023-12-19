import {
	colorize,
	emitWarning
} from "@anio-jsbundler/utilities"

export default function(file) {
	let msg = ``

	msg += `Ignoring unsupported file ${colorize(`src/export/${file}`, "yellow")}`

	msg += ` in export folder ; this file should be removed.`

	emitWarning(msg)
}
