import crypto from "node:crypto"
import fs from "node:fs"

export default function(file) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash("sha1")
		const stream = fs.createReadStream(file)

		stream.on("error", reject)
		stream.on("data", data => hash.update(data))

		stream.on("end", () => {
			resolve(hash.digest("hex"))
		})
	})
}
