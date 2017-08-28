/*
 * PREDIX DESIGN SYSTEM SASSDOC GENERATOR
 *
 * Crawls a list of Predix Design System CSS modules and extracts valuable
 * metadata from each: available flags, available styles, defaults, etc.
 *
 * Drop this file into a directory that holds all of the CSS module repositories
 * cloned from Github. You'll also need to install the sassdoc module
 * (e.g. `npm install -g sassdoc` or `npm install sassdoc` to do it locally).
 *
 * Then, run this file using node and pipe the stdout to a file. The result
 * will be an array of objects with information about each module.
 *
 * @example
 * ```
 * $ node sassdoc.js > sassdoc-data.json
 * ```
 */

/**
 * Parser module that crawls a list of Predix Design System Scss modules and
 * extracts valuable metadata from each: flags, styles, import statements.
 * @module parse
 */

const fs = require('fs');
const path = require('path');
const sassdoc = require('sassdoc');
const scssModules = require('./scss-modules.json');
const scssLayers = require('./scss-layers.json');

/*******************************************************************************
 * CONSTANTS AND UTIL METHODS
 ******************************************************************************/

const SCSS_FILE_REGEX = /^\_.+\.scss/;

const capitalize = str => str.slice(0,1).toUpperCase() + str.slice(1);

const pad = (str, len, char=' ') => {
  if (str.length >= len) return str;
  while (str.length !== len) {
    str = str + char;
  };
  return str;
};

/*******************************************************************************
 * INTERNAL PARSING METHODS
 ******************************************************************************/

function processScssModule(dir, moduleName) {
  const moduleFolder = path.join(dir, moduleName);
  const moduleFiles = fs.readdirSync(moduleFolder);
  const scssFileNames = moduleFiles.filter(f => SCSS_FILE_REGEX.test(f));
  const scssFileName = moduleName === 'px-normalize-design' ? scssFileNames[1] : scssFileNames[0];
  return sassdoc.parse(path.join(dir, moduleName, scssFileName)).then(d => {
   return Promise.resolve(formatScssData(moduleName, scssFileName, d));
  }, { verbose: false, debug: false });
};

function formatScssData(moduleName, fileName, data) {
  const flags = data
    .filter(d => d.context.type === 'variable' && Array.isArray(d.group) && /\:variables\:flag$/.test(d.group[0]))
    .map(d => flattenScssVariable(d, 'flag'));
  const styles = data.filter(d => d.context.type === 'variable' && Array.isArray(d.group) && /\:variables\:style$/.test(d.group[0]))
    .map(d => flattenScssVariable(d, 'style'));
  const layer = /^\_([a-z]+)\./.exec(fileName)[1];

  return {
    moduleName,
    fileName,
    layer,
    data,
    flags,
    styles
  };
};

function flattenScssVariable(variable, use) {
  return {
    use: use,
    description: variable.description ? variable.description.replace('\n', '') : null,
    name: variable.context.name,
    type: variable.type,
    value: variable.context.value,
    scope: variable.context.scope
  };
};

/*******************************************************************************
 * INTERNAL PRINTING METHODS
 ******************************************************************************/

function sortModulesByLayer(scssData) {
  return scssLayers.map((layer) => {
    const modules = scssData.filter(m => m.layer === layer);
    return {
      layer,
      modules
    };
  });
};

function printVars(variables, includeComments, markDefaults) {
  // Get the largest variable length for prettier printing
  const len = variables.reduce((maxLen, v) => v.name.length > maxLen ? v.name.length : maxLen, 0);
  return variables.map(v => {
    let text = '';
    if (includeComments && v.description) {
      text += `/* ${v.description} */\n`;
    }
    text += `$${pad(v.name,len)} : ${v.value}; ${markDefaults && v.scope === 'default' ? '/* default */' : ''}`;
    return text;
  }).join('\n') + '\n';
};

/*******************************************************************************
 * PUBLIC METHODS
 ******************************************************************************/

/**
 * Crawls and parses the sassdoc data for a list of Scss modules. Must be run
 * from a script in a directory beside all of the Scss modules.
 *
 * @return {Promise.<Array>} Resolves to an array of objects for each module
 *                           with sassdoc data
 */
function getScssData(dir) {
  return Promise.all(scssModules.map(m => processScssModule(dir, m)));
};

/**
 * Takes parsed sassdoc data and returns printed out text with the available
 * style variables exposes by each Scss module.
 *
 * @example
 *
 *     getScssData().then(data => {
 *       const scssStyles = toScssVariables(data);
 *       console.log(scssStyles);
 *     });
 *
 * @param  {Array}   scssData        Data from `getScssData` method
 * @param  {Boolean} includeComments Enable to add usage comments above each style
 * @param  {Boolean} markDefaults    Enable to add comments showing which styles
 *                                   are default and can be overriden
 * @return {String} Scss formatted variables
 */
function toScssVariables(scssData, includeComments, markDefaults) {
  const modulesByLayer = sortModulesByLayer(scssData);
  return modulesByLayer.reduce((text, layer) => {
    text += `// ${capitalize(layer.layer)}\n\n`;
    layer.modules.forEach(m => {
      if (m.styles && m.styles.length) {
        text += `/* ${pad(m.moduleName+' ', 80, '*')}*/\n`;
        text += printVars(m.styles, includeComments, markDefaults);
        text += '\n';
      }
    });
    return text + '\n';
  }, '');
};

/**
 * Takes parsed sassdoc data and returns printed out text with import statements
 * and flags for each Scss module. The result can be pased into a .scss file
 * and compiled to create CSS for an app.
 *
 * @example
 *
 *     getScssData().then(data => {
 *       const scssImports = toScssImports(data);
 *       console.log(scssImports);
 *     });
 *
 * @param  {Array}   scssData        Data from `getScssData` method
 * @param  {Boolean} includeComments Enable to add usage comments above each flag
 * @param  {Boolean} markDefaults    Enable to add comments showing which flags
 *                                   are default and can be overriden
 * @return {String} Scss formatted flags
 */
function toScssImports(scssData, includeComments, markDefaults) {
  const modulesByLayer = sortModulesByLayer(scssData);
  return modulesByLayer.reduce((text, layer) => {
    text += `// ${capitalize(layer.layer)}\n`;
    layer.modules.forEach(m => {
      if (m.flags && m.flags.length) {
        text += printVars(m.flags, includeComments, markDefaults);
      }
      text += `@import '${m.moduleName}/${m.fileName}';\n`;
    });
    return text + '\n';
  }, '');
};

exports = module.exports = {
  getScssData,
  toScssVariables,
  toScssImports
};
