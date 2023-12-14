export default function(str, suffix) {
	if (!str.endsWith(suffix)) {
		throw new Error(
			`String does not end with '${suffix}'.`
		)
	}

	return str.slice(
		0, str.length - suffix.length
	)
}
