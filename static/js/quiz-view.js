import * as _ from "./jquery";
$(async function () {
  // * this data is not fragile
  const prerenderScript = $("#server-prerender-data");
  const prerenderData = JSON.parse(prerenderScript.text());

  const quizId = prerenderData["id"];
  const questions = prerenderData["questions"];

  // * dynamic elements
  const questionsElement = $("#questions");

  // * this fragment allows insert batching.
  const questionFragment = document.createDocumentFragment();

  // * function to create multiple choice input source.
  // * this modularity allows me to plug n' play every
  // * bit of feature.
  // ! DO NOT REMOVE, WILL BREAK THE RENDERING.
  function createMultipleChoiceInput(question, nth) {
    const answerChoices = question["answerChoices"];
    const inputSource = document.createElement("div");

    // * bind all attributes to the input choice
    // * wrapper.
    inputSource.setAttribute("class", "");
    inputSource.setAttribute("id", `question-choice-group-wrapper-${nth}`);

    let i = 0;
    for (const choice of answerChoices) {
      // * creates text nodes
      const text = document.createTextNode(choice);

      // * these are interchangeable.
      // * i prefer `i` when referring to the current index of this
      // * choice. i prefer `value` when referring to the value of
      // * this choice. in this case, its just the index.
      const value = i;

      // * the actual wrapper to wrap up the label
      // * and input.
      const choiceWrapper = document.createElement("div");

      // * the thing i am actually rendering.
      const input = document.createElement("input");

      // * this is the label.
      const label = document.createElement("label");

      // * build the id for the wrapper.
      const id = `question-choice-${nth}-${i}`;

      // * bind the attributes on the wrapper.
      choiceWrapper.setAttribute("id", id);

      // * build the id for this field.
      const inputId = `${id}-input`;

      // * append the id attribute here.
      input.setAttribute("id", inputId);

      // * build the name.
      const name = `question-choice-group-${nth}`;

      // * make it a radio input.
      input.setAttribute("type", "radio");

      // * append the name attribute.
      input.setAttribute("name", name);

      // * append the value attribute.
      input.setAttribute("value", value);

      // * bind the label for the question choice.
      label.setAttribute("for", inputId);

      // * add classes to the choice wrapper
      choiceWrapper.setAttribute("class", "");

      // * build the DOM tree
      label.appendChild(text);
      choiceWrapper.appendChild(input); // * append input first.
      choiceWrapper.appendChild(label); // * append label second.
      inputSource.appendChild(choiceWrapper); // * connect the choice wrapper.
      i++;
    }

    // * add classes to the question
    // * group wrapper
    inputSource.setAttribute("class", "flex flex-col gap-2");

    return inputSource;
  }

  // * function to create questions
  function createQuestionElement(question, nth) {
    const questionText = question["question"];
    const questionType = question["type"];

    const questionWrapper = document.createElement("div");
    const questionTextElement = document.createTextNode(questionText);
    const questionTitleElement = document.createElement("h2");
    // * varies.
    let inputSource = null;

    if (questionType === 0) {
      inputSource = createMultipleChoiceInput(question, nth);
    }

    // * bind the classes on the question wrapper.
    questionWrapper.setAttribute("class", "m-2");

    // * bind the classes on the header section.
    questionTitleElement.setAttribute("class", "text-lg");

    // * build the dom tree further
    questionTitleElement.appendChild(questionTextElement);
    questionWrapper.appendChild(questionTitleElement);

    // * if we have an input source. append.
    if (inputSource) {
      questionWrapper.appendChild(inputSource);
    }

    return questionWrapper;
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionElement = createQuestionElement(question, i + 1);

    // * this here is very fast.
    // * this batches question inserts.
    questionFragment.appendChild(questionElement);
  }

  questionsElement.append(questionFragment);
});
