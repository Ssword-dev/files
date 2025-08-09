import h from "../modules/dom-utils/index.js";

function Sidebar({ className, initState, onStateChange, children }) {
  const state = h.reactive({
    collapsed: false,
  });

  const wrapper = h.element("div", { class: className });
  const content = h.element(
    "div",
    { class: "sidebar-content-wrapper" },
    h.fragment(...children)
  );

  wrapper.appendChild(content);

  function update() {
    if (state.collapsed) {
      wrapper.classList.add("collapsed");
    } else {
      wrapper.classList.remove("collapsed");
    }
  }

  if (typeof initState === "function") {
    initState(state);
  }

  update();

  // after the update, subscribe to the
  // reactions.
  h.subscribe(state, function (state) {
    if (onStateChange) {
      onStateChange(state.collapsed); // let it update visual markers.
      update(); // update the class.
    }
  });

  return wrapper;
}
