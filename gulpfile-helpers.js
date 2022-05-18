const options = require("./config.gulp"); // paths and other options from config.js
var yaml = require("js-yaml");
var fs = require("graceful-fs");
const lodash = require("lodash.merge");
const traverse = require("traverse");
const resolve = require("object-resolve-path");

// merge yaml files
function mergeYaml(files = [], extra = {}) {
  var mergedConfig;
  files.forEach(function (file) {
    var parsedConfig = yaml.load(fs.readFileSync(file, "utf-8"));
    if (!mergedConfig) {
      mergedConfig = parsedConfig;
    } else {
      /* The last files will take the highest precedence */
      lodash(mergedConfig, parsedConfig, extra);
    }
  });
  return mergedConfig;
}

module.exports = {
  prepYaml(locale) {
    var yml = mergeYaml([`${options.paths.src.data}/config.yaml`, `${options.paths.src.data}/values.yaml`], {
      locale,
    });

    // TODO: make this more efficient
    traverse(yml).forEach(function (_) {
      // use localization values
      if (this.node[locale]) {
        this.update(this.node[locale]);
      }

      // to allow references in yaml
      // grab value between {{ }}
      try {
        if (typeof this.node === "string" || this.node instanceof String) {
          var counter = 0;
          var newNodeStr = this.node;

          while (newNodeStr.includes("{{") && newNodeStr.includes("}}")) {
            if (counter > 5) break;

            let rawPath = newNodeStr.substring(newNodeStr.indexOf("{{") + 2, newNodeStr.lastIndexOf("}}"));
            let path = rawPath.trim();

            newNodeStr = newNodeStr.replace(`{{${rawPath}}}`, resolve(yml, path));

            counter += 1;
          }

          if (counter > 0) this.update(newNodeStr);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return yml;
  },
};
