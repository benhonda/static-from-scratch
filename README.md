# Nunjucks-Gulp-Tailwind-Alpine starter

A bare bones project template that helps you build static sites :rocket: **fast** :rocket:

## Get started

1. Clone or download the repo
1. Install dependencies

   ```bash
   npm install
   ```

1. Spin up a server and run all Gulp tasks

   ```bash
   gulp watch
   ```

1. A browser window will open to `https://localhost:3000/en`. Navigate to `https://localhost:3000/fr` for the French version.

## Details

### Content

1. English content goes into [locales/en.yaml](src/locales/en.yaml). French content goes into [locales/fr.json](src/locales/en.yaml). You need to use the same variable name (the key in the key-value) in both of these files. See [pages/index.njk](src/pages/index.njk) for implementation.

    If you prefer to use JSON, you can do so by changing the appropriate tasks in [the gulpfile](gulpfile.js) (code for it is there, just need to uncomment and remove the YAML implementation).

### Other Gulp tasks

There are other Gulp tasks you can (and should) run that aren't automatically run with the `gulp` command. These include:

- `a11y`: Uses the `gulp-accessibility` plugin to check for accessibility problems in your HTML.
- `validate`: Uses the `gulp-html` plugin to validate your HTML.
