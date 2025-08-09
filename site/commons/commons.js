"use strict";

// (EN)
// To anyone reading this, this used to be a
// workaround for the fact that you cant style
// things when clicked unless a bunch of javascript.
// but the browser does not fire the transitions and animations start
// event fast enough so im scrapping this idea.

// (TL-PH / Tagalog)
// Sa makakabasa nito, ito ay dapat ay workaround
// sa hindi pwedeng malagyan ng style ang pinindut na element.
// pero yung browser ay hindi nag eemit ng event ng mabilis kaya
// hindi ko na ito tinuloy.

// (() => {
//   const interactionMap = new WeakMap();
//   const ongoingEffectsMap = new WeakMap();

//   function hasEffect(el) {
//     const effect = ongoingEffectsMap.get(el);
//     return effect && (effect.transitioning || effect.animating);
//   }

//   function dispatchEffectEndListeners(el, cb) {
//     function cleanup() {
//       if (!hasEffect(el)) {
//         cb();
//         el.removeEventListener("transitionend", cleanup);
//         el.removeEventListener("animationend", cleanup);
//       }
//     }

//     el.addEventListener("transitionend", cleanup, { once: true });
//     el.addEventListener("animationend", cleanup, { once: true });
//   }

//   function waitForEffects(el) {
//     return new Promise((resolve) => {
//       el.offsetHeight;
//       // give the browser time to emit transitionstart/animationstart
//       requestAnimationFrame(() => {
//         if (hasEffect(el)) {
//           dispatchEffectEndListeners(el, resolve);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }

//   async function dispatchStateClass(el, cls) {
//     el.classList.add(cls);
//     await waitForEffects(el);
//     el.classList.remove(cls);
//   }

//   function handleEffectStart(evt, type) {
//     const el = evt.target;

//     if (!ongoingEffectsMap.has(el)) {
//       ongoingEffectsMap.set(el, { transitioning: false, animating: false });
//     }

//     console.log("Effect starting...");
//     const effect = ongoingEffectsMap.get(el);
//     effect[type] = true;
//   }

//   function handleEffectEnd(evt, type, altType) {
//     const el = evt.target;
//     const effect = ongoingEffectsMap.get(el);

//     console.log("Effect ending...");
//     if (!effect) {
//       console.warn(`[commons]: No effect found for ${type}end event.`);
//       return;
//     }

//     effect[type] = false;

//     if (!effect[altType]) {
//       ongoingEffectsMap.delete(el);
//     }
//   }

//   window.addEventListener("transitionstart", (e) =>
//     handleEffectStart(e, "transitioning"),
//   );
//   window.addEventListener("animationstart", (e) =>
//     handleEffectStart(e, "animating"),
//   );

//   window.addEventListener("transitionend", (e) =>
//     handleEffectEnd(e, "transitioning", "animating"),
//   );
//   window.addEventListener("animationend", (e) =>
//     handleEffectEnd(e, "animating", "transitioning"),
//   );

//   window.addEventListener("click", async function (evt) {
//     const target = evt.target;

//     if (target instanceof HTMLElement) {
//       let state = interactionMap.get(target);

//       // this means the element has not received any interaction
//       // before.
//       if (!state) {
//         state = {};
//         interactionMap.set(target, state);
//       }

//       if (state.clicked) {
//         return;
//       }

//       // update state
//       state.clicked = true;

//       // dispatch state class
//       await dispatchStateClass(target, "dom-state-clicked");

//       // update state
//       state.clicked = false;
//     }
//   });
// })();
