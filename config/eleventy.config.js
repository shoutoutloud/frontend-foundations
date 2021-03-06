const {DateTime} = require('luxon')
const CleanCSS = require('clean-css')
const UglifyJS = require('uglify-js')
const pluginRss = require('@11ty/eleventy-plugin-rss')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.addFilter(
    'cssmin',
    code => new CleanCSS({}).minify(code).styles,
  )

  eleventyConfig.addFilter('jsmin', code => {
    let minified = UglifyJS.minify(code)
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error)
      return code
    }
    return minified.code
  })

  eleventyConfig.addFilter('permalink', str => str.replace(/\.html/g, ''))

  eleventyConfig.addFilter('readableDate', dateObj =>
    DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy'),
  )

  eleventyConfig.addNunjucksFilter('prepend', function(value, prepender) {
    return value === '/' ? prepender : prepender + value
  })

  eleventyConfig.addCollection('jobs', collection => {
    return collection
      .getFilteredByGlob('**/jobs/**/!(index)*.md')
      .reverse()
      .filter(item => item.data.status === 'open')
  })

  eleventyConfig.addLayoutAlias('default', 'layouts/default.njk')
  eleventyConfig.addLayoutAlias('markdown', 'layouts/markdown.njk')
  eleventyConfig.addLayoutAlias('page', 'layouts/page.njk')

  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('src/icons')
  eleventyConfig.addPassthroughCopy('src/sw.js')

  return {
    templateFormats: ['njk', 'md', 'html'],
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'www',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: false,
    passthroughFileCopy: true,
  }
}
