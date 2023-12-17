export default function(str, color) {
	if (color === "yellow") {
		return `\u001b[1;33m${str}\u001b[0;0m`
	} else if (color === "white") {
		return `\u001b[1;37m${str}\u001b[0;0m`
	} else if (color === "blue") {
		return `\u001b[36m${str}\u001b[0;0m`
	} else if (color === "gray") {
		return `\u001b[0;30m${str}\u001b[0;0m`
	}
}
