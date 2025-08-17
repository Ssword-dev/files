import h from "../modules/dom-utils/index";

export function createCarouselHandle(items = []) {
  const state = h.reactive({
    index: 0,
    items,
  });

  return {
    state,
    next() {
      if (state.index < state.items.length - 1) {
        state.index++;
      }
    },
    prev() {
      if (state.index > 0) {
        state.index--;
      }
    },
    goTo(i) {
      if (i >= 0 && i < state.items.length) {
        state.index = i;
      }
    },
    addItem(item) {
      state.items.push(item);
    },
    removeCurrent({ destructive } = {}) {
      const idx = state.index;

      if (idx < 0 || idx >= state.items.length) return;

      // remove the item from the reactive array
      const removed = state.items.splice(idx, 1)[0];

      // adjust index if we removed the last item
      if (state.index >= state.items.length) {
        state.index = state.items.length - 1;
      }

      if (destructive && removed) {
        const node = typeof removed === "function" ? removed() : removed;
        if (node?.remove) node.remove();
        return node;
      }
    },
  };
}
export function defaultCarouselControls({ handle }) {
  const container = h.element("div", {
    class:
      "carousel-controls flex justify-center items-center w-full mb-2 gap-3",
  });

  const prevBtn = h.element(
    "button",
    {
      class: "carousel-btn px-3 py-1 rounded bg-secondary text-main",
    },
    h.text("Prev"),
  );

  const nextBtn = h.element(
    "button",
    {
      class: "carousel-btn px-3 py-1 rounded bg-secondary text-main",
    },
    h.text("Next"),
  );

  const indicator = h.element(
    "span",
    { class: "text-subtle mx-2" },
    h.text(`${handle.state.index + 1} / ${handle.state.items.length}`),
  );

  prevBtn.addEventListener("click", () => handle.prev());
  nextBtn.addEventListener("click", () => handle.next());

  // subscribe to update indicator and disable buttons at edges
  h.subscribe(handle.state, (s) => {
    indicator.innerText = `${s.index + 1} / ${s.items.length}`;

    prevBtn.disabled = s.index === 0;
    nextBtn.disabled = s.index === s.items.length - 1;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  });

  container.appendChild(prevBtn);
  container.appendChild(indicator);
  container.appendChild(nextBtn);

  return container;
}

export function CarouselCurrentElement({ handle, className }) {
  const container = h.element("div", {
    class: h.className("carousel-current w-full h-full", className),
  });

  function update(s) {
    container.innerHTML = "";
    if (s.items.length > 0) {
      const item = s.items[s.index];
      const node = typeof item === "function" ? item() : item;
      container.appendChild(node);
    }
  }

  h.subscribe(handle.state, update);

  update(handle.state);

  return container;
}

export function Carousel({
  handle,
  className = "",
  controlFactory = defaultCarouselControls,
  display = CarouselCurrentElement({ handle }),
}) {
  return h.element(
    "div",
    { class: h.className("carousel flex flex-col w-full h-full", className) },
    display,
    controlFactory({ handle }),
  );
}
