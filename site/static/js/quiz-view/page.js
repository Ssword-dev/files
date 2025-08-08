// ! For those who are reading. no, you should not change
// ! this function's name to anything other than `h`.
// * For those wondering why, its called *hyperscript* convention.
// * basically its that things that represents a vdom or a real dom
// * should declare the functions (or should be imported) as `h`.
// * but this `h` function is also a namespace (read docs).
// * also this `h` thing is like just jsx... but not compiled so...
// * but it works...
import h from "../modules/dom-utils.js";
import QuestionType from "../enum/question-type.js";

class QuizViewPage {
  constructor() {
    this.queue = [];
    this.timer = null; // Promise<void> | null
    this.stateNodes = {
      currentQuestion: null,
    }; // Record<string, HTMLElement | null>
  }

  // * Function Component for creating multi choice input.
  // ! DO NOT REMOVE, WILL BREAK THE RENDERING.
  MultipleChoiceInput = ({ question, nth }) => {
    const answerChoices = question["answerChoices"];
    const inputSource = h.element("div", {
      class: "flex flex-col gap-2",
      id: `question-choice-group-wrapper-${nth}`,
    });

    let i = 0;
    for (const choice of answerChoices) {
      // * build the id for the wrapper.
      const id = `question-choice-${nth}-${i}`;

      // * build the id for this field.
      const inputId = `${id}-input`;

      // * build the name.
      const name = `question-choice-group-${nth}`;

      // * these are interchangeable.
      // * i prefer `i` when referring to the current index of this
      // * choice. i prefer `value` when referring to the value of
      // * this choice. in this case, its just the index.
      const value = i;

      // * the actual wrapper to wrap up the label
      // * and input.
      const choiceWrapper = h.element(
        "div",
        {
          id: id,
        },
        h.element("input", {
          class: "",
          type: "radio",
          id: inputId,
          name: name,
          value: value,
        }), // input
        h.element(
          "label",
          {
            for: inputId,
          },
          h.text(choice),
        ), // label
      );

      inputSource.appendChild(choiceWrapper); // * connect the choice wrapper.
      i++;
    }

    return inputSource;
  };

  // * Function Component for creating
  // * question elements.
  QuestionElement = ({ question, nth }) => {
    const questionText = question["question"];
    const questionType = question["type"];

    const questionWrapper = h.element(
      "div",
      {
        class: "m-2",
      },
      h.element(
        "h2",
        {
          class: "text-lg",
        },
        h.text(questionText),
      ),
    );

    // * varies.
    let inputSource = null;

    if (questionType === QuestionType.MultipleChoice) {
      inputSource = h(this.MultipleChoiceInput, { question, nth });
    }

    // * if there is an input source. push.
    if (inputSource) {
      questionWrapper.appendChild(inputSource);
    }

    return questionWrapper;
  };

  async unmountCurrentQuestionElement() {}

  async main() {
    // * this data is not fragile
    const prerenderScript = document.querySelector("#server-prerender-data");
    const prerenderData = JSON.parse(prerenderScript.textContent || "");

    const quizId = prerenderData["id"];
    const questions = prerenderData["questions"];

    // * dynamic elements
    const questionsElement = document.querySelector("#questions");

    // * this fragment allows insert batching.
    const questionFragment = h.root();

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionElement = h(this.QuestionElement, {
        question,
        nth: i + 1,
      });
      // * this here is very fast.
      // * this batches question inserts.
      questionFragment.appendChild(questionElement);
    }

    questionsElement.append(questionFragment);
  }
}

const app = new QuizViewPage();
app.main().catch(console.error);
