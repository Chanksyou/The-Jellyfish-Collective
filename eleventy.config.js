export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");

  // Newest-first list of past activations, if you later split them into files.
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Photo helpers — data lives in src/_data/photos.json and events.json.
  eleventyConfig.addFilter("cover", (list) => (list || []).find((p) => p.cover) || (list || [])[0]);
  eleventyConfig.addFilter("teaser", (list, n = 3) => {
    const c = (list || []).find((p) => p.cover) || (list || [])[0];
    return (list || []).filter((p) => p !== c).slice(0, n);
  });
  // Every photo, dealt round-robin across events so the wall mixes years.
  eleventyConfig.addFilter("wall", (photos, events) => {
    const decks = events.map((e) => (photos[e.slug] || []).map((p) => ({ ...p, event: e })));
    const out = [];
    for (let i = 0; decks.some((d) => d.length > i); i++)
      decks.forEach((d) => d[i] && out.push(d[i]));
    return out;
  });
  eleventyConfig.addFilter("neighbours", (events, slug) => {
    const i = events.findIndex((e) => e.slug === slug);
    return { newer: i > 0 ? events[i - 1] : null, older: i >= 0 ? events[i + 1] || null : null };
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
