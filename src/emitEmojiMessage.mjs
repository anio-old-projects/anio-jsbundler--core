let last_used_emoji = ""
import {colorize} from "@anio-jsbundler/utilities"

export default function a(emoji, message, arg) {
	message = message.split("%").join(
		colorize(arg, emoji === "⚙️" ? "white" : "blue")
	)

	if (emoji === last_used_emoji) {
		process.stderr.write(`   ${message}\n`)
	} else {
		let s = emoji === "⚙️" ? " " : ""
		process.stderr.write(`${emoji}${s} ${message}\n`)
	}

	last_used_emoji = emoji
}


a("🧼", "cleaning %", "a")
a("🧼", "cleaning %", "aa")
a("⚙️", "generating %", "b")
a("⚙️", "generating %", "so")
