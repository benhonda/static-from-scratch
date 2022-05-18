module.exports = {
  config: {
    tailwindjs: "./tailwind.config.js",
    port: 3001,
  },
  paths: {
    root: "./",
    src: {
      base: "./src",
      assets: {
        base: "./src/assets",
        scss: "./src/assets/scss",
        js: "./src/assets/js",
        img: "./src/assets/img",
        fonts: "./src/assets/fonts",
        favicon: "./src/assets/favicon",
      },
      data: "./src/data",
      pages: "./src/pages",
      layouts: "./src/layouts",
      macros: "./src/macros",
    },
    dist: {
      base: "./dist",
      css: "./dist/css",
      js: "./dist/js",
      img: "./dist/img",
      fonts: "./dist/fonts",
    },
  },
};
