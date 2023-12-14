import stripSuffix from "./stripSuffix.mjs"

export default function(name) {
	let fn_name = stripSuffix(name, ".mjs")

	fn_name = fn_name.split("/").join("$")
	fn_name = fn_name.split(".").join("_")

	return fn_name
}
