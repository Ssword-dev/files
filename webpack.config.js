const path = require("path");
const JXTemplatePlugin = require("./tools/webpack/plugins/jxt.js"); // adjust path as needed

module.exports = {
  mode: "development", // or "production"
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new JXTemplatePlugin({
      input: ["./src/components/**/*.template"],
      output: "bundle.template", // will be written to dist/bundle.template
    }),
  ],
};
