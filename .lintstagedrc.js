const path = require('path')

const buildEslintCommand = (filenames) =>
  `eslint lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  'src/*.{js,jsx,ts,tsx}': [buildEslintCommand],
}