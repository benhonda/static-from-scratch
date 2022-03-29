const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const postcss = require("gulp-postcss");
const data = require("gulp-data");
const sync = require("browser-sync").create();
var yaml = require("js-yaml");
var fs = require("graceful-fs");

/**
 * task: nunjucks-en
 * desc: gets .html and .nunjucks files in src, renders them, and outputs to English dist/
 */
gulp.task("nunjucks-en", () => {
  return (
    gulp
      .src("src/pages/**/*.+(html|nunjucks|njk)")
      // .pipe(data(() => require("./src/locales/en.json")))  // JSON implementation
      .pipe(data(() => yaml.load(fs.readFileSync("./src/locales/en.yaml", "utf-8"))))
      .pipe(nunjucksRender({ path: ["src/templates"] }))
      .pipe(gulp.dest("dist/en"))
  );
});

/**
 * task: nunjucks-fr
 * desc: gets .html and .nunjucks files in src, renders them, and outputs to French dist/
 */
gulp.task("nunjucks-fr", () => {
  return (
    gulp
      .src("src/pages/**/*.+(html|nunjucks|njk)")
      // .pipe(data(() => require("./src/locales/fr.json")))  // JSON implementation
      .pipe(data(() => yaml.load(fs.readFileSync("./src/locales/fr.yaml", "utf-8"))))
      .pipe(nunjucksRender({ path: ["src/templates"] }))
      .pipe(gulp.dest("dist/fr"))
  );
});

/**
 * task: copy-styles
 * desc: renders Tailwind stuff and outputs CSS to dist/
 */
gulp.task("copy-styles", () => {
  return gulp
    .src("src/assets/css/**/*.css")
    .pipe(
      postcss([
        require("tailwindcss"),
        require("autoprefixer"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
      ])
    )
    .pipe(gulp.dest("dist/assets/css"));
});

/**
 * task: copy-js
 * desc: copies JS into dist/
 */
gulp.task("copy-js", () => {
  return gulp.src("src/assets/js/**/*.js").pipe(gulp.dest("dist/assets/js"));
});

/**
 * task: copy-img
 * desc: copies img folder into dist/
 */
gulp.task("copy-img", () => {
  return gulp.src("src/assets/img/**/*").pipe(gulp.dest("dist/assets/img"));
});

/**
 * task: copy-fonts
 * desc: copies img folder into dist/
 */
gulp.task("copy-fonts", () => {
  return gulp.src("src/assets/fonts/**/*").pipe(gulp.dest("dist/assets/fonts"));
});

/**
 * task: watch
 * desc: watches files for changes, also serves the app from ./dist
 */
gulp.task(
  "watch",
  gulp.series(() => {
    sync.init({
      server: { baseDir: "./dist" },
      startPath: "/en",
    });

    return gulp.watch("src/**/*.+(html|nunjucks|njk|js|css|scss)", gulp.series(["default"])).on("change", sync.reload);
  })
);

/**
 * task: default
 * desc: ran on "gulp"
 */
gulp.task("default", gulp.series(["nunjucks-en", "nunjucks-fr", "copy-js", "copy-styles", "copy-img", "copy-fonts"]));

/**
 * ********************************************
 * Misc
 * These might be helpful:
 * ********************************************
 */

/**
 * task: validate
 * desc: HTML validation
 */
const validator = require("gulp-html");

gulp.task("validate", () => {
  return gulp.src("./dist/**/*.html").pipe(validator());
});

/**
 * task: a11y
 * desc: Accessibility
 */
const a11y = require("gulp-accessibility");
const rename = require("gulp-rename");

gulp.task("a11y", () => {
  return gulp
    .src("./dist/**/*.html")
    .pipe(a11y({ force: true }))
    .on("error", console.log)
    .pipe(a11y.report({ reportType: "txt" }))
    .pipe(rename({ extname: ".txt" }))
    .pipe(gulp.dest("a11y_reports"));
});
