import * as React from "./mini-react/dist/index.js";

// GOAL: make this actually render
var h = React.createElement;

function App() {
  return h(
    "div",
    {},
    h(
      "span",
      {},
      h(
        "p",
        {},
        "Hello world!",
        h(
          "a",
          { href: "https://google.com" },
          "Go to google for no apparent reason"
        )
      )
    )
  );
}
React.render(h(App), document.body);
