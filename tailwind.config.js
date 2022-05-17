module.exports = {
  content: ["./dist/**/*.{html,js}"],
  purge: ["./src/**/*.{html,njk,nunjucks}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
