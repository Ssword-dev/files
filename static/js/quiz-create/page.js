"use strict";

import * as cp from "../modules/component-parser.js";
import { sideEffects as jxinit } from "../modules/jx.js";
import { lazy } from "../modules/lazy.js";

jxinit();
$(async function () {
  const quizGroup = await lazy("/q/components/quiz-components.html");
  // store the portal root in the closure.
  // but this time,  i will not remove it from the
  // DOM, because i might need to portal something
  const portalRoot = $("#portal-root");

  // some solution to fix elements
  // this one fixes heights of text areas to
  // scale with what the user is typing.
  function allowAutoAdjustHeight($el) {
    return $el.on("input", function () {
      // optim: only adjust height if the element overflows.
      if (this.scrollHeight > this.clientHeight) {
        this.style.height = "auto"; // invalidate height (allow shrink)
        this.style.height = `${this.scrollHeight}px`;
      }
    });
  }

  // basically a react replacement. but raw DOM
  function createFromTemplate(templateId, group = quizGroup) {
    return cp.createFromTemplate(group[templateId]);
  }

  window.createFromTemplate = createFromTemplate;

  function createChoicesGroup() {
    const group = $(createFromTemplate("choices-group"));
    group.append(createChoiceTile()); // initial tile
    return group;
  }

  function createChoiceTile() {
    const tile = $(createFromTemplate("choice-tile"));

    tile
      // on keydown, if the user presses enter,
      // then we will move to the next tile's input
      // or else, we will create a new tile, then
      // move to the created tile's input
      .on("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // prevent form submission
          const nextTile = $(this).next(".choice-tile");

          if (nextTile.length > 0) {
            // yield focus to the next sibling tile.
            nextTile.first().find("choice-text").focus();
          } else {
            // create a new tile and focus on it.
            const newTile = createChoiceTile();
            $(this).after(newTile);
            newTile.find(".choice-text").focus();
          }
        }
      })
      // on click of the remoe button, remove self
      .find(".remove-choice-button")
      .click(function (e) {
        e.stopImmediatePropagation(); // prevent from more bubbling.

        const items = $(this).parent().parent().children(".choice-tile").length;

        // if this is the only tile, then we should NOT be able to remove it

        if (items <= 1) {
          console.log("Cannot remove the last choice tile.");
          return;
        }

        $(this).parent().remove(); // removes the tile
      });
    return tile;
  }

  function updateSpecBox(question, specBox) {
    // remove the old spec box if it exists
    question.find(".spec-box").empty();

    // append the new spec box
    if (specBox) {
      question.find(".spec-box").append(specBox);
    }
    console.log("Updated specbox.");
  }

  // initialize the page, the user should
  // see one empty question already created
  const createEmptyQuestion = function () {
    const question = createFromTemplate("empty-question");

    // initial spec box. basically this is a thing
    // that changes based on question type.
    let specBox = createChoicesGroup();

    // append the choice group
    question.find("select.question-type-selection").change(function () {
      const selectedType = $(this).val();

      switch (selectedType - 0) {
        case 0:
          // multiple choice
          specBox = createChoiceTile();
          break;

        case 1:
          // open ended
          specBox = null; // no spec box.
          break;
      }

      updateSpecBox(question, specBox);
    });

    allowAutoAdjustHeight(question.find(".question-title-text"));

    updateSpecBox(question, specBox); // initial render

    return question;
  };

  $("#quiz-questions").append(createEmptyQuestion());
  $("#quiz-create-button-tray")
    .append(
      $(createFromTemplate("button-1"))
        .text("Add Question")
        .click(function () {
          $("#quiz-questions").append(createEmptyQuestion());
        }),
    )
    .append(
      $(createFromTemplate("button-1"))
        .text("Finalize Quiz")
        .click(function () {
          const rawQuestions = $("#quiz-questions")
            .children(".question")
            .toArray()
            .map((q) => {
              const $q = $(q);
              const title =
                $q.find(".question-title-text").val().trim() || "\uE000";
              // the value of the select element. tis a number.
              const type = $q.find(".question-type-selection").val() - 0;

              // prevents the choices from being evaluated if it does not need choices.
              // its an optim.
              const choices =
                type === 0
                  ? $q
                      // find all the choice tiles
                      .find(".choices-group .choice-tile")
                      // normalize the choices into an array.
                      .toArray()
                      // only return the text of the choices
                      .map((c) => $(c).find(".choice-text").val())
                      // filter out empty choices
                      .filter((c) => Boolean(c.trim()))
                  : null;

              return {
                title: title,
                type: type,
                choices: choices, // only if multiple choice
              };
            });

          console.log("Questions: " + JSON.stringify(rawQuestions, null, 2));
        }),
    );
});
