// ! Keep the name `h` for hyperscript convention.
// * See notes in original file for why this is used.
import h from "../modules/dom-utils/index.js";
import QuestionType from "../enum/question-type.js";

class QuizViewPage {
  queue = [];
  timer = null;
  timerDuration = 10;
  responses = {};
  stateNodes = { currentQuestion: null };
  quizId = null;
  questions = [];
  display = null;
  state = null;
  timerTextEl = null;
  timerHeaderEl = null;

  constructor() {
    const prerenderData = JSON.parse(
      document.querySelector("#server-prerender-data").textContent || "",
    );

    this.quizId = prerenderData.id;
    this.questions = prerenderData.questions;

    this.state = h.reactive({
      currentTimeLeft: this.timerDuration,
    });

    this.display = document.querySelector("#display-container");
  }

  async main() {
    this.display.appendChild(h(this.TimerDisplayElement.bind(this)));
    this.display.appendChild(h(this.QuestionDisplayElement.bind(this)));
  }

  MultipleChoiceInputSource({ choices, index }) {
    const container = h.element("div", { class: "flex flex-col gap-2" });
    choices.forEach((choice, choiceIndex) => {
      const choiceId = `q${index}-choice-${choiceIndex}`;
      const radio = h.element("input", {
        type: "radio",
        name: `q${index}-group`,
        id: choiceId,
        value: choiceIndex,
      });

      radio.addEventListener(
        "change",
        this.handleMultipleChoiceChange.bind(this, index, choiceIndex, choice),
      );

      const label = h.element(
        "label",
        { for: choiceId, class: "cursor-pointer" },
        h.text(choice),
      );

      container.appendChild(
        h.element("div", { class: "flex items-center gap-2" }, radio, label),
      );
    });

    return container;
  }

  handleMultipleChoiceChange(index, choiceIndex, choice) {
    this.responses[index] = {
      type: QuestionType.MultipleChoice,
      value: choiceIndex,
      label: choice,
    };
  }

  OpenEndedInputSource({ index, className = "" }) {
    const textarea = h("textarea", {
      class: h.class("open-ended-textarea", className),
      placeholder: "Write your answer here...",
      rows: "4",
    });

    textarea.addEventListener(
      "input",
      this.handleOpenEndedInput.bind(this, index, textarea),
    );

    return textarea;
  }

  async handleOpenEndedInput(index, textarea) {
    const sh = await h.style.read(() => textarea.scrollHeight);
    await h.style.reflow(() => {
      textarea.style.height = "auto";
    });
    await h.style.write(() => {
      textarea.style.height = `${sh}px`;
    });

    this.responses[index] = {
      type: QuestionType.OpenEnded,
      value: textarea.value,
    };
  }

  ShortAnswerInputSource({ index, className = "" }) {
    const input = h("input", {
      type: "text",
      class: h.class("short-answer-input", className),
      placeholder: "Type your answer here...",
    });

    input.addEventListener(
      "input",
      this.handleShortAnswerInput.bind(this, index, input),
    );

    return input;
  }

  handleShortAnswerInput(index, input) {
    this.responses[index] = {
      type: QuestionType.ShortAnswer,
      value: input.value,
    };
  }

  LongAnswerInputSource({ index, className = "" }) {
    const textarea = h("textarea", {
      class: h.class("long-answer-textarea", className),
      placeholder: "Write your detailed answer here...",
      rows: "6",
    });

    textarea.addEventListener(
      "input",
      this.handleLongAnswerInput.bind(this, index, textarea),
    );

    return textarea;
  }

  async handleLongAnswerInput(index, textarea) {
    const sh = await h.style.read(() => textarea.scrollHeight);
    await h.style.reflow(() => {
      textarea.style.height = "auto";
    });
    await h.style.write(() => {
      textarea.style.height = `${sh}px`;
    });

    this.responses[index] = {
      type: QuestionType.LongAnswer,
      value: textarea.value,
    };
  }

  QuestionElement({ question }) {
    // destructure props with expected JSON keys
    const { index, title, type, choices } = question;

    const backdropWrapper = h.element("div", {
      class:
        "flex flex-col justify-center align-center self-center gap-4 w-full h-full border rounded shadow",
      id: `question-${index}`,
    });

    const wrapper = h.element("div", {
      class:
        "flex flex-col w-2/5 sm:w-5/6 h-3/5 sm:w-4/5 justify-center align-center self-center",
    });

    wrapper.appendChild(
      h.element("h2", { class: "text-[2rem] font-semibold" }, h.text(title)),
    );

    let inputArea;

    switch (type) {
      case QuestionType.MultipleChoice:
        inputArea = h(this.MultipleChoiceInputSource.bind(this), {
          choices,
          index,
        });
        break;

      case QuestionType.ShortAnswer:
        inputArea = h(this.ShortAnswerInputSource.bind(this), { index });
        break;

      case QuestionType.LongAnswer:
        inputArea = h(this.LongAnswerInputSource.bind(this), { index });
        break;

      case QuestionType.OpenEnded:
      default:
        inputArea = h(this.OpenEndedInputSource.bind(this), { index });
        break;
    }

    wrapper.appendChild(inputArea);
    backdropWrapper.appendChild(wrapper);
    return backdropWrapper;
  }

  ResultDisplay() {
    const scoreText = h.element(
      "div",
      {
        class:
          "px-5 py-3 rounded-lg shadow-inner border bg-secondary text-main",
        id: "score",
      },
      h.text("Loading..."),
    );

    const display = h.element(
      "div",
      {
        class:
          "flex flex-col items-center justify-center w-full p-6 rounded-xl shadow-lg gap-4 bg-primary text-main",
      },
      h.element("div", { class: "text-2xl font-bold" }, "Quiz Results"),
      scoreText,
    );

    console.log(this.responses);

    fetch("/q/site/api/quiz/check.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: this.quizId,
        responses: this.responses,
      }),
    })
      .then((resp) => resp.json())
      .then((jsonBody) => {
        console.log(jsonBody);
        scoreText.innerText = jsonBody["score"];
      })
      .catch(console.error);

    return display;
  }

  QuestionDisplayElement() {
    const stack = this.questions.map((v, i) => ({ ...v, index: i }));
    const display = h.element(
      "div",
      { class: "flex flex-col justify-center align-center h-full w-full" },
      h.text("Loading..."),
    );

    // kick off the loop
    this.runQuestionLoop(display, stack);
    return display;
  }

  async runQuestionLoop(display, stack) {
    while (stack.length > 0) {
      const currentQuestion = stack.shift();
      await h.style.reflow(() => {
        display.innerHTML = "";
        display.appendChild(
          h(this.QuestionElement.bind(this), { question: currentQuestion }),
        );
      });

      this.state.currentTimeLeft = this.timerDuration;
      await this.runTimer();

      if (!this.responses[currentQuestion.index]) {
        stack.push(currentQuestion);
      }
    }
    await this.finalizeDisplay();
  }

  async runTimer() {
    return new Promise((resolve) => {
      const iv = setInterval(() => {
        this.state.currentTimeLeft--;
        if (this.state.currentTimeLeft <= 0) {
          clearInterval(iv);
          resolve();
        }
      }, 1000);
    });
  }

  async finalizeDisplay() {
    await h.style.reflow(() => {
      this.display.innerHTML = "";
      this.display.appendChild(h(this.ResultDisplay.bind(this)));
    });
  }

  TimerDisplayElement() {
    this.timerTextEl = h.element("span", {});
    this.timerHeaderEl = h.element(
      "h1",
      {
        class: h.class("self-center", "text-xl", "select-none", "quiz-timer"),
      },
      this.timerTextEl,
    );

    // subscribe to the state to update the timer.
    h.subscribe(this.state, this.updateTimerText.bind(this));
    this.updateTimerText(this.state);
    return this.timerHeaderEl;
  }

  updateTimerText(state) {
    h.style.reflow(() => {
      this.timerTextEl.innerText = `${state.currentTimeLeft} seconds left!`;
      if (state.currentTimeLeft <= 5) {
        this.timerHeaderEl.classList.add("low-time");
      } else {
        this.timerHeaderEl.classList.remove("low-time");
      }
    });
  }
}

const app = new QuizViewPage();
app.main().catch(console.error);
