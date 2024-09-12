import chalk from 'chalk'
import { readFileSync, writeFileSync } from 'fs'

const AT_SYMBOL_REGEXP = /[{']*@['}]*/g
const AT_REPLACEMENT = "{'@'}"

const filePaths = ['src/i81n/locale/en.json', 'src/i81n/locale/pt.json', 'src/i81n/locale/es.json']

filePaths.forEach((path) => {
	// For each given path, read in the json file
	const resolvedPath = new URL(path, import.meta.url)
	const json = JSON.parse(readFileSync(resolvedPath))
	// fix all anomolies in the given file
	const fixedValues = fixValuesInJson(json)
	if (fixedValues.length) {
		// write the results back to the file on disk
		const pretty = JSON.stringify(json, null, '\t')
		writeFileSync(resolvedPath, pretty)
	}
	// output any changes to the console
	printSuccesses(path, fixedValues)
})

function fixValuesInJson(json) {
	const fixes = []
	Object.entries(json).forEach(([key, value]) => {
		if (!value) return
		if (typeof value === 'object') return fixValuesInJson(value)
		if (value.includes('@')) {
			json[key] = value.replaceAll(AT_SYMBOL_REGEXP, AT_REPLACEMENT)
			if (value !== json[key]) {
				fixes.push({ key, value: json[key], prev: value })
			}
		}
		return json
	})
	return fixes
}

function printSuccesses(path, fixedValues) {
	if (!fixedValues.length) {
		return console.log(chalk.green(`Fixed 0 strings in ${path} ✅`))
	}
	console.log(
		chalk.magenta(`Fixed ${fixedValues.length} strings in ${path} ✅`)
	)
	fixedValues.forEach(({ key, value, prev }) => {
		console.log(chalk.cyan(`  ${key}:`))
		console.log(chalk.yellow('    From:'), chalk.white(prev))
		console.log(chalk.yellow('    To:'), chalk.white(value))
	})
}
