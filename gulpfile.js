/*
  Usage:
  1. npm install // To install all dev dependencies of package
  2. npm run dev // To start development and server for live preview
  3. npm run prod // To generate minifed files for live server
*/

const { src, dest, task, watch, series, parallel } = require("gulp");
const del = require("del"); // For Cleaning build/dist for fresh export
const options = require("./config.gulp"); // paths and other options from config.js
const { prepYaml } = require("./gulpfile-helpers"); // helper functions for tasks
const browserSync = require("browser-sync").create();
const nunjucksRender = require("gulp-nunjucks-render");
const data = require("gulp-data");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss"); //For Compiling tailwind utilities with tailwind config
const concat = require("gulp-concat"); //For Concatinating js,css files
const uglify = require("gulp-terser"); //To Minify JS files
const imagemin = require("gulp-imagemin"); //To Optimize Images
const cleanCSS = require("gulp-clean-css"); //To Minify CSS files
const purgecss = require("gulp-purgecss"); // Remove Unused CSS from Styles
const rename = require("gulp-rename"); // to rename files/dirs

//Load Previews on Browser on dev
function livePreview(done) {
  browserSync.init({
    server: {
      baseDir: options.paths.dist.base,
    },
    startPath: "/",
    port: options.config.port || 3001,
  });
  done();
}

// Triggers Browser reload
function previewReload(done) {
  console.log("\n\t Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}

//Development Tasks
function devHTML(locale = "en", type = "yaml") {
  return src(`${options.paths.src.base}/pages/**/*.+(html|nunjucks|njk)`)
    .pipe(data(prepYaml(locale)))
    .pipe(nunjucksRender({ path: [options.paths.src.layouts, options.paths.src.macros] }))
    .pipe(
      rename((path) => {
        // renaming files so that we can remove file extensions in the URL!
        // i.e. example.com/hello instead of example.com/hello.html
        if (path.basename !== "index") {
          path.dirname = path.basename;
          path.basename = "index";
        }
      })
    )
    .pipe(dest(`${options.paths.dist.base}${locale == "en" ? "" : `/${locale}`}`));
}

function devStyles() {
  const tailwindcss = require("tailwindcss");
  return src(`${options.paths.src.assets.scss}/**/*.scss`)
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(options.paths.src.assets.scss)) // this is needed for postCSS... feels weird
    .pipe(
      postcss([
        tailwindcss(options.config.tailwindjs),
        require("autoprefixer"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
      ])
    )
    .pipe(concat({ path: "styles.css" }))
    .pipe(dest(options.paths.dist.css));
}

function devScripts() {
  return src([
    `${options.paths.src.assets.js}/libs/**/*.js`,
    `${options.paths.src.assets.js}/**/*.js`,
    `!${options.paths.src.assets.js}/**/external/*`,
  ])
    .pipe(concat({ path: "scripts.js" }))
    .pipe(dest(options.paths.dist.js));
}

function devImages() {
  return src(`${options.paths.src.assets.img}/**/*`).pipe(dest(options.paths.dist.img));
}

function devFavicon() {
  return src(`${options.paths.src.assets.favicon}/**/*.{png,ico,svg,webmanifest}`).pipe(dest(options.paths.dist.base));
}

function devFonts() {
  return src(`${options.paths.src.assets.fonts}/**/*`).pipe(dest(options.paths.dist.fonts));
}

function watchFiles() {
  watch(
    `${options.paths.src.base}/**/*.+(html|nunjucks|njk)`,
    series(
      () => devHTML("en"),
      () => devHTML("fr"),
      devStyles,
      previewReload
    )
  );
  watch([options.config.tailwindjs, `${options.paths.src.assets.scss}/**/*.scss`], series(devStyles, previewReload));
  watch(`${options.paths.src.assets.js}/**/*.js`, series(devScripts, previewReload));
  watch(`${options.paths.src.assets.img}/**/*`, series(devImages, previewReload));
  watch(`${options.paths.src.assets.fonts}/**/*`, series(devFonts, previewReload));
  console.log("\n\t Watching for Changes..\n");
}

function devClean() {
  console.log("\n\t Cleaning dist folder for fresh start.\n");
  return del([options.paths.dist.base]);
}

// Production Tasks (Optimized Build for Live/Production Sites)

function prodHTML() {
  return parallel(
    () => devHTML("en"),
    () => devHTML("fr")
  );
}

function prodStyles() {
  return src(`${options.paths.dist.css}/**/*`)
    .pipe(
      purgecss({
        content: ["src/**/*.{html,js,njk,nunjucks}"],
        defaultExtractor: (content) => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
      })
    )
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest(options.paths.dist.css));
}

function prodScripts() {
  return src([`${options.paths.src.assets.js}/libs/**/*.js`, `${options.paths.src.assets.js}/**/*.js`])
    .pipe(concat({ path: "scripts.js" }))
    .pipe(uglify())
    .pipe(dest(options.paths.dist.js));
}

function prodImages() {
  return src(options.paths.src.assets.img + "/**/*")
    .pipe(imagemin())
    .pipe(dest(options.paths.dist.img));
}

function prodFavicon() {
  return devFavicon();
}

function prodFonts() {
  return src(`${options.paths.src.assets.fonts}/**/*`).pipe(dest(options.paths.dist.fonts));
}

function prodClean() {
  return devClean();
}

function buildFinish(done) {
  console.log("\n\t", `Production build is complete. Files are located at ${options.paths.dist.base}\n`);
  done();
}

exports.default = series(
  devClean, // Clean Dist Folder
  parallel(
    devStyles,
    devScripts,
    devImages,
    devFavicon,
    devFonts,
    () => devHTML("en"),
    () => devHTML("fr")
  ), //Run All tasks in parallel
  livePreview, // Live Preview Build
  watchFiles // Watch for Live Changes
);

// run tasks with no preview and no watch
exports.test = series(
  devClean, // Clean Dist Folder
  parallel(
    devStyles,
    devScripts,
    devImages,
    devFavicon,
    devFonts,
    () => devHTML("en"),
    () => devHTML("fr")
  )
);

exports.prod = series(
  prodClean, // Clean Build Folder
  parallel(prodStyles, prodScripts, prodImages, prodFavicon, prodFonts, prodHTML), //Run All tasks in parallel
  buildFinish
);
