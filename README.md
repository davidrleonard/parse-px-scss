parse-px-scss
====================

A small command line utility and JavaScript module that helps parse Predix Design System Scss modules and extract import statements, flags, and themable variables.

# Using the CLI

1. Clone this repository from Github and cd into the new directory

```
$ git clone git@github.com:davidrleonard/parse-px-scss.git
$ cd parse-px-scss
```

2. Run `$ npm install` (or `$ yarn install`)
3. Run `$ bower install`
4. Run `$ npm link` to enable the CLI alias

You'll now have access to the `parse-px-scss` command. Type `$ parse-px-scss -h` for more info on available commands.

### Printing out the imports/flags and variables

After following the steps above, type the following command to read the Scss modules in the bower_components/ folder (installed with `$ bower install` above) and output the imports/flags and variables to scss files:

```
$ parse-px-scss imports -d bower_components -o imports-with-flags.scss
$ parse-px-scss variables -d bower_components -o variables.scss
```

Then open `imports-with-flags.scss` and `variables.scss` to see the output.

# Using the JS module

All of the CLI behaviors are available as a JavaScript module. Follow the steps below and refer to the API docs for help using the module:

1. Install the module via. npm:

```bash
$ npm install parse-px-scss
```

2. Import the module in your JavaScript file:

```js
const parse = require('parse-px-scss');
```
## API

* [parse](#module_parse)
    * [~getScssData()](#module_parse..getScssData) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [~toScssStyles(scssData, includeComments, markDefaults)](#module_parse..toScssStyles) ⇒ <code>String</code>
    * [~toScssImports(scssData, includeComments, markDefaults)](#module_parse..toScssImports) ⇒ <code>String</code>

### parse~getScssData() ⇒ <code>Promise.&lt;Array&gt;</code>
Crawls and parses the sassdoc data for a list of Scss modules. Must be run
from a script in a directory beside all of the Scss modules.

**Kind**: inner method of [<code>parse</code>](#module_parse)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Resolves to an array of objects for each module
                          with sassdoc data  
<a name="module_parse..toScssStyles"></a>

### parse~toScssStyles(scssData, includeComments, markDefaults) ⇒ <code>String</code>
Takes parsed sassdoc data and returns printed out text with the available
style variables exposes by each Scss module.

**Kind**: inner method of [<code>parse</code>](#module_parse)  
**Returns**: <code>String</code> - Scss formatted variables  

| Param | Type | Description |
| --- | --- | --- |
| scssData | <code>Array</code> | Data from `getScssData` method |
| includeComments | <code>Boolean</code> | Enable to add usage comments above each style |
| markDefaults | <code>Boolean</code> | Enable to add comments showing which styles                                   are default and can be overriden |

**Example**  
```js
getScssData().then(data => {
      const scssStyles = toScssStyles(data);
      console.log(scssStyles);
    });
```
<a name="module_parse..toScssImports"></a>

### parse~toScssImports(scssData, includeComments, markDefaults) ⇒ <code>String</code>
Takes parsed sassdoc data and returns printed out text with import statements
and flags for each Scss module. The result can be pased into a .scss file
and compiled to create CSS for an app.

**Kind**: inner method of [<code>parse</code>](#module_parse)  
**Returns**: <code>String</code> - Scss formatted flags  

| Param | Type | Description |
| --- | --- | --- |
| scssData | <code>Array</code> | Data from `getScssData` method |
| includeComments | <code>Boolean</code> | Enable to add usage comments above each flag |
| markDefaults | <code>Boolean</code> | Enable to add comments showing which flags                                   are default and can be overriden |

**Example**  
```js
getScssData().then(data => {
      const scssImports = toScssImports(data);
      console.log(scssImports);
    });
```
