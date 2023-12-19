import {
	colorize,
	emitWarning
} from "@anio-jsbundler/utilities"

export default function(functions) {
	const reserved = ["importWithContext", "dict"]

	return functions.filter(fn => {
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
