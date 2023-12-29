import path from "node:path"
import fs from "node:fs/promises"
import getAutoGenerateWarningComment from "./util/getAutoGenerateWarningComment.mjs"

import {
	IdentifierGenerator
} from "@anio-jsbundler/utilities"

import {
	namedExports
} from "@anio-jsbundler/utilities/codegenerator"

function importStatement(alias, path){
	return `import ${alias} from ${JSON.stringify(path)}\n`
}

function addFunction(fn, generator) {
	let ret = ""

	const fn_name = fn.canonical_name
	const fn_path = "../export/" + fn.canonical_path + ".mjs"

	const fn_factory_name = fn.canonical_name + "Factory"
	const fn_factory_path = "../export/" + fn.canonical_path + "Factory.mjs"

	// null means use imported user defined function
	let fn_source = null, fn_factory_source = null

	// auto-generate factory
	if (fn.autogen === "factory") {
		const fn_id = generator.insert(fn_name)
		ret += importStatement(fn_id, fn_path)

		fn_factory_source = `function ${fn_name}Factory(new_context) { return ${fn_id}; }`
	}
	// auto-generate function
	else if (fn.autogen === "function") {
		const fn_factory_id = generator.insert(fn_factory_name)
		ret += importStatement(fn_factory_id, fn_factory_path)

		fn_source = fn_factory_id + "(_module_default_context)"
	}
	// both function and factory were specified by user
	else if (fn.autogen === null) {
		const fn_id = generator.insert(fn_name)
		const fn_factory_id = generator.insert(fn_factory_name)

		ret += importStatement(fn_id, fn_path)
		ret += importStatement(fn_factory_id, fn_factory_path)
	}

	if (fn_source === null) {
		fn_source = generator.lookup(fn_name)
	}

	if (fn_factory_source === null) {
		fn_factory_source = generator.lookup(fn_factory_name)
	}

	let named_exports = [{
		key: fn_name,
		value: `createNamedAnonymousFunction("${fn_name}", ${fn_source})`
	}, {
		key: fn_factory_name,
		value: `wrapFactory("${fn_name}", ${fn_factory_source})`
	}]

	return ret + namedExports(named_exports, {
		pad_to_longest_key: false
	})
}

export default async function(project, library_functions) {
	let src = await getAutoGenerateWarningComment()

	src += `
/* Module's default context */
import {createDefaultContextAsync} from "@anio-jsbundler/runtime"
const _module_default_context = await createDefaultContextAsync()

export function getUsedDefaultContext() {
	return _module_default_context
}

import {
	default as wrapFactory,
	createNamedAnonymousFunction
} from "./wrapFactory.mjs"

`
	let generator = new IdentifierGenerator()

	for (const fn of library_functions) {
		src += `/* ${fn.canonical_path} */\n`
		src += addFunction(fn, generator)
		src += "\n"
	}

	src = src.slice(0, src.length - 1)

	await fs.writeFile(
		path.join(project.root, "src", "auto", "library.mjs"),
		src
	)

	await fs.writeFile(
		path.join(project.root, "src", "auto", "wrapFactory.mjs"),
		`${await getAutoGenerateWarningComment()}
import {createDefaultContextAsync} from "@anio-jsbundler/runtime"

/* Used to give a consistent name to the exported functions and wrapped factories */
export function createNamedAnonymousFunction(name, fn) {
	let tmp = {
		[\`\${name}\`](...args) {
			return fn(...args)
		}
	}

	return tmp[\`\${name}\`]
}

/**
 * Wraps a factory so that plugs can be specified.
 * If no context was given, a new one will be created.
 */
export default function(fn_name, factory) {
	return createNamedAnonymousFunction(\`\${fn_name}FactoryAsync\`, async (plugs = {}, new_context = null) => {
		let context = new_context

		if (context === null) {
			context = await createDefaultContextAsync()
		}

		/* plugs = null is just to indicate that plugs aren't used */
		if (plugs !== null) {
			for (const key in plugs) {
				context.plugs[key] = plugs[key]
			}
		}

		const fn = factory(context)

		// make sure created function is named correctly
		return createNamedAnonymousFunction(fn_name, fn)
	})
}
`
	)
}
