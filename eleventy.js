const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Kopiraj sve potrebne mape u finalni build
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_includes");
  // --- KLJUČNI ISPRAVAK ZA RASPORED JE OVDJE ---
  eleventyConfig.addPassthroughCopy("_data");

  eleventyConfig.addCollection("novosti", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/novosti/*.md").sort((a, b) => {
      return b.data.post_date - a.data.post_date;
    });
  });

  eleventyConfig.addFilter("date", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(format);
  });
  
  return {
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data", // Eleventy čita iz ove mape
      output: "_site",
    },
  };
};
