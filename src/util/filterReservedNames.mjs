import {
	colorize,
	emitWarning
} from "@anio-jsbundler/utilities"

export default function(library) {
	const reserved = [
		"importWithContext",
		"importWithContextAsync",
		"dict",
		"getUsedDefaultContext"
	]

	return library.filter(entry => {
		const fn = entry.canonical_name

		if (reserved.includes(fn)) {
			let msg = ``

			msg += `You cannot have an export named ${colorize(fn, "yellow")} or ${colorize(`${fn}Factory`, "yellow")}`
			msg += ` ; these exports will be ignored.`

			emitWarning(msg)

			return false
		}

		return true
	})
}
