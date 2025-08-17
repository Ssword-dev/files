import h from "../../../modules/dom-utils/index.js";
import QuestionType from "../../../enum/question-type.js";
import {
  createCarouselHandle,
  Carousel,
  CarouselCurrentElement,
} from "../../../components/Carousel.js";

class QuizViewPage {
  responses = {};
  display = null;
  handle = null;

  constructor() {
    const prerenderData = JSON.parse(
      document.querySelector("#server-prerender-data").textContent || "",
    );

    this.questions = prerenderData.questions;
    this.quizId = prerenderData.id;

    this.display = document.querySelector("#display-container");
    this.handle = createCarouselHandle([]);
  }

  main() {
    // add questions as carousel items
    this.questions.forEach((q, i) => {
      this.handle.addItem(() =>
        this.QuestionElement({ question: { ...q, index: i } }),
      );
    });

    // mount carousel
    this.display.appendChild(
      Carousel({
        handle: this.handle,
        className: "flex flex-col justify-center items-center w-full h-full",
        display: CarouselCurrentElement({
          handle: this.handle,
          className: "flex justify-center items-center w-full h-full",
        }),
      }),
    );

    h.subscribe(this.handle.state, (state) => {
      const items = state.items;

      if (items.length === 0) {
        this.showResults();
      }
    });
  }

  QuestionElement({ question }) {
    const { index, title, type, choices } = question;

    const wrapper = h.element("div", {
      class: "flex flex-col self-center gap-4 p-4 rounded shadow w-full h-full",
    });

    wrapper.appendChild(
      h.element("h2", { class: "text-xl font-semibold" }, h.text(title)),
    );

    let inputArea;
    switch (type) {
      case QuestionType.MultipleChoice:
        inputArea = this.MultipleChoiceInputSource({ choices, index });
        break;
      case QuestionType.ShortAnswer:
        inputArea = this.ShortAnswerInputSource({ index });
        break;
      case QuestionType.LongAnswer:
        inputArea = this.LongAnswerInputSource({ index });
        break;
      case QuestionType.OpenEnded:
      default:
        inputArea = this.OpenEndedInputSource({ index });
        break;
    }

    wrapper.appendChild(inputArea);

    // submit button
    const submitBtn = h.element(
      "button",
      {
        class: "mt-4 px-4 py-2 bg-blue-500 text-white rounded",
        onClick: () => this.finalizeAnswer(index, wrapper),
      },
      h.text("Submit"),
    );

    wrapper.appendChild(submitBtn);
    return wrapper;
  }

  finalizeAnswer(index, wrapper) {
    console.log("Clicked");
    // remove the question from carousel
    this.handle.removeCurrent(wrapper, { destructive: true });
    // move carousel forward
    this.handle.next();

    // if at the end, show results
    if (this.handle.state.index >= this.questions.length) {
      this.showResults();
    }
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

      radio.addEventListener("change", () => {
        this.responses[index] = {
          type: QuestionType.MultipleChoice,
          value: choiceIndex,
          label: choice,
        };
      });

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

  ShortAnswerInputSource({ index }) {
    const input = h("input", {
      type: "text",
      class: "short-answer-input",
      placeholder: "Type your answer...",
    });
    input.addEventListener("input", () => {
      this.responses[index] = {
        type: QuestionType.ShortAnswer,
        value: input.value,
      };
    });
    return input;
  }

  LongAnswerInputSource({ index }) {
    const textarea = h("textarea", {
      class: "long-answer-textarea",
      placeholder: "Write your detailed answer...",
      rows: 6,
    });
    textarea.addEventListener("input", () => {
      this.responses[index] = {
        type: QuestionType.LongAnswer,
        value: textarea.value,
      };
    });
    return textarea;
  }

  OpenEndedInputSource({ index }) {
    const textarea = h("textarea", {
      class: "open-ended-textarea",
      placeholder: "Write your answer...",
      rows: 4,
    });
    textarea.addEventListener("input", () => {
      this.responses[index] = {
        type: QuestionType.OpenEnded,
        value: textarea.value,
      };
    });
    return textarea;
  }

  showResults() {
    this.display.innerHTML = "";

    const scoreText = h.element(
      "div",
      { class: "p-4 rounded shadow bg-gray-100 text-black" },
      h.text("Loading..."),
    );

    this.display.appendChild(
      h.element(
        "div",
        {
          class:
            "flex flex-col justify-center align-center items-center self-center h-full w-full gap-4",
        },
        h.element("h2", {}, h.text("Quiz Results")),
        scoreText,
      ),
    );

    fetch("/q/site/api/quiz/check.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.quizId, responses: this.responses }),
    })
      .then((resp) => resp.json())
      .then((jsonBody) => {
        scoreText.innerText = `Score: ${jsonBody.score}`;
      })
      .catch(console.error);
  }
}

// mount
const app = new QuizViewPage();
app.main();
