/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 120, // max 120 chars in line, code is easy to read
  useTabs: false, // use spaces instead of tabs
  tabWidth: 2, // "visual width" of of the "tab"
  trailingComma: 'es5', // add trailing commas in objects, arrays, etc.
  semi: true, // add ; when needed
  singleQuote: true, // '' for stings instead of ""
  bracketSpacing: true, // import { some } ... instead of import {some} ...
  arrowParens: 'always', // braces even for single param in arrow functions (a) => { }
  jsxSingleQuote: false, // "" for react props, like in html
  bracketSameLine: false, // pretty JSX
  plugins: ['prettier-plugin-tailwindcss'],
  // tailwindcss
  tailwindAttributes: ['theme'],
  tailwindFunctions: ['twMerge', 'createTheme'],
};
