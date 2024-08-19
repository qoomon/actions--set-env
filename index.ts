/* eslint-disable camelcase */
import * as core from '@actions/core'
import {getInput} from '@actions/core'
import {run} from './lib/actions.js'
import {fileURLToPath} from 'url'
import * as process from 'node:process'

export const action = () => run(async () => {
  const inputs = {
    vars: getInput('vars') ? JSON.parse(getInput('vars')) || {} : {},
    secrets: getInput('secrets') ? JSON.parse(getInput('secrets')) || {} : {},
    scope: getInput('scope'),
    export: getInput('export')
        // split by newline or comma
        .split(/[\n,]/)
        // trim whitespace
        .map((name) => name.trim())
        // remove empty strings
        .filter((name) => name !== '')
        // replace unsupported GitHub variable name characters with underscores
        .map((name) => name.replace(/[^a-zA-Z0-9_]/g, '_')),
  }

  core.setOutput('scope', inputs.scope)

  inputs.export.forEach((exportName) => {
    let sourceName: string | undefined
    let sourceValue: string | undefined

    if (inputs.scope) {
      // postfix scope
      const postfixScopedName = `${exportName}__${inputs.scope}`
      const postfixScopedValue = getContextValue(postfixScopedName)
      // prefix scope
      const prefixScopedName = `${inputs.scope}__${exportName}`
      const prefixScopedValue = getContextValue(prefixScopedName)

      if (postfixScopedValue !== undefined && prefixScopedValue !== undefined) {
        throw new Error(`Duplicated variable '${exportName}' for scope '${inputs.scope}' ` +
            `(${postfixScopedValue}, ${prefixScopedValue}).`)
      }

      if (postfixScopedValue !== undefined) {
        sourceName = postfixScopedName
        sourceValue = postfixScopedValue
      } else if (prefixScopedValue !== undefined) {
        sourceName = prefixScopedName
        sourceValue = prefixScopedValue
      }
    }

    if (sourceValue === undefined) {
      sourceName = exportName
      sourceValue = getContextValue(exportName)
    }

    if (sourceValue === undefined) {
      throw new Error(`Export name '${exportName}' could not be found in context.`)
    }

    if (sourceName === exportName) {
      core.info(`Export variable '${exportName}'`)
    } else {
      core.info(`Export variable '${sourceName}' as '${exportName}'`)
    }
    core.exportVariable(exportName, sourceValue)
  })

  /**
   * Get the value of a context variable
   * @param name - variable name
   * @returns the variable value
   */
  function getContextValue(name: string) {
    return inputs.secrets[name] ?? inputs.vars[name]
  }
})

// --- main ---

// Execute the action, if running as the main module
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  action()
}
