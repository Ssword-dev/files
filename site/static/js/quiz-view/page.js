// ! For those who are reading. no, you should not change
// ! this function's name to anything other than `h`.
// * For those wondering why, its called *hyperscript* convention.
// * basically its that things that represents a vdom or a real dom
// * should declare the functions (or should be imported) as `h`.
// * but this `h` function is also a namespace (read docs).
// * also this `h` thing is like just jsx... but not compiled so...
// * but it works...
import h from "../modules/dom-utils/index.js";
import QuestionType from "../enum/question-type.js";

class QuizViewPage {
  constructor() {
    this.queue = [];
    this.timer = null; // Promise<void> | null
    this.timerDuration = 1;
    this.stateNodes = {
      currentQuestion: null,
    }; // Record<string, HTMLElement | null>

    this.responses = {}; // Record<number, object>

    // * this data is not fragile
    const prerenderScript = document.querySelector("#server-prerender-data");
    const prerenderData = JSON.parse(prerenderScript.textContent || "");

    this.quizId = prerenderData["id"];
    this.questions = prerenderData["questions"];

    // * uh so i dont have react. sadly. so i have
    // * this mini reactive system (vue inspired).
    // * basically it lets you subscribe to it to listen
    // * for property changes. subscribing allows me to update
    // * the ui.
    // * see modules/dom-utils/reactive.js to see more.
    this.state = h.reactive({
      currentTimeLeft: this.timerDuration,
    });
  }

  async main() {
    const display = document.querySelector("#display-container");

    display.appendChild(h(this.TimerDisplayElement));
    display.appendChild(h(this.QuestionDisplayElement));
  }

  // * component that renders a single question + its input
  QuestionElement = ({ question }) => {
    const { index, question: text, type, answerChoices } = question;

    // * wrapper for the whole question
    const wrapper = h.element("div", {
      class: "flex flex-col gap-4 p-4 border rounded shadow",
      id: `question-${index}`,
    });

    // * question text
    const questionTextEl = h.element(
      "h2",
      { class: "text-lg font-semibold" },
      h.text(text)
    );

    wrapper.appendChild(questionTextEl);

    // * the input area varies depending on type
    let inputArea = null;

    if (type === QuestionType.MultipleChoice) {
      // * multiple choice input group
      inputArea = h.element("div", { class: "flex flex-col gap-2" });

      answerChoices.forEach((choice, choiceIndex) => {
        const choiceId = `q${index}-choice-${choiceIndex}`;
        const radio = h.element("input", {
          type: "radio",
          name: `q${index}-group`,
          id: choiceId,
          value: choiceIndex,
        });

        // * on select, store the response
        radio.addEventListener("change", () => {
          this.responses[index] = {
            type,
            value: choiceIndex,
            label: choice,
          };
        });

        const label = h.element(
          "label",
          { for: choiceId, class: "cursor-pointer" },
          h.text(choice)
        );

        const choiceWrapper = h.element(
          "div",
          { class: "flex items-center gap-2" },
          radio,
          label
        );

        inputArea.appendChild(choiceWrapper);
      });
    } else {
      const textInput = h.element("input", {
        type: "text",
        class: "border p-2 rounded",
        placeholder: "Type your answer...",
      });

      textInput.addEventListener("input", (e) => {
        this.responses[index] = {
          type,
          value: e.target.value,
        };
      });

      inputArea = textInput;
    }

    if (inputArea) {
      wrapper.appendChild(inputArea);
    }

    return wrapper;
  };

  QuestionDisplayElement = () => {
    const stack = this.questions.map((v, i) => ({
      ...v,
      index: i, // adds an index property for tracking.
    }));
    const slot = h.element("div", {}, h.text("Loading..."));
    const display = h.element("div", {}, slot);
    const headlessState = {
      currentQuestion: null,
    };

    const runTimer = () =>
      new Promise((resolve) => {
        const iv = setInterval(() => {
          // pre-increment
          // this triggers timer change
          // with very tiny latency cuz no diffing
          // (YAAAAAAAAAAAAAAAAAAAAAAYYYYYY!)
          this.state.currentTimeLeft--;

          if (this.state.currentTimeLeft == 0) {
            resolve(true);
            clearTimeout(iv);
          }
        }, 1000);
      });

    const loop = async () => {
      while (stack.length > 0) {
        const currentQuestion = stack.shift();
        headlessState.currentQuestion = currentQuestion;

        // render question
        display.innerHTML = "";
        display.appendChild(
          h(this.QuestionElement, { question: currentQuestion })
        );
        this.state.currentTimeLeft = this.timerDuration;

        // wait for timer
        await runTimer();

        // requeue if unanswered
        // this loops for unanswered questions
        // to let the user go back to questions
        // kinda like duolingo style.
        if (!this.responses[currentQuestion.index]) {
          stack.push(currentQuestion);
        }
      }

      await finalize();
    };

    const finalize = async () => {
      console.log(this.responses);
    };

    loop();

    return display;
  };

  TimerDisplayElement = () => {
    const timerText = h.element("span", {});
    const timerHeader = h.element(
      "h1",
      { class: "self-center text-xl" },
      timerText
    );

    function updateTimerText(state) {
      timerText.innerText = `${state.currentTimeLeft} seconds left!`;
    }

    h.subscribe(this.state, updateTimerText);

    updateTimerText(this.state);

    return timerHeader;
  };

  DisplayElement = () => {};
}

const app = new QuizViewPage();
app.main().catch(console.error);
