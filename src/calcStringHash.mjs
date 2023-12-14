import crypto from "node:crypto"
import fs from "node:fs"

export default function(str) {
	return new Promise((resolve) => {
		const hash = crypto.createHash("sha1")

		hash.update(str)

		resolve(hash.digest("hex"))
	})
}
