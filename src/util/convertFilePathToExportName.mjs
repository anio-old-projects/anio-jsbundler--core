import {
	stripSuffix
} from "@anio-jsbundler/utilities"

export default function(name) {
	let fn_name = name

	if (fn_name.endsWith(".mjs")) {
		fn_name = stripSuffix(fn_name, ".mjs")
	}

	fn_name = fn_name.split("/").join("$")
	fn_name = fn_name.split(".").join("_")

	return fn_name
}
