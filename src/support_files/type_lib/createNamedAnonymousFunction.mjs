/* Used to give a consistent name to the exported functions and wrapped factories */
export function createNamedAnonymousFunction(name, fn) {
	let tmp = {
		[`${name}`](...args) {
			return fn(...args)
		}
	}

	return tmp[`${name}`]
}
