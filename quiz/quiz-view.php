<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

  <link href="../static/css/tailwind-dist.css">
  <style>
    :root {
      --font-family: sans-serif;
      --font-size-base: 1rem;
      --font-size-question: 1.1rem;

      --color-bg: #f4f4f4;
      --color-text: #222;
      --color-card-bg: #ffffff;
      --color-border: #ddd;
      --color-accent: #007BFF;
      --color-accent-hover: #0056b3;
      --color-button-text: #ffffff;
      --color-button-muted-bg: #000000;
      --color-button-muted: #ffffff;

      --padding-form: 24px;
      --padding-button: 12px;

      --max-width: 600px;
      --border-radius: 8px;
      --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      --spacing-question: 24px;
    }

    body {
      font-family: var(--font-family);
      background-color: var(--color-bg);
      margin: 0;
      padding: 0;
      color: var(--color-text);
    }

    form {
      display: flex;
      flex-direction: column;
      max-width: var(--max-width);
      margin: 40px auto;
      padding: var(--padding-form);
      background-color: var(--color-card-bg);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
    }

    .qf_question_tile {
      margin-bottom: var(--spacing-question);
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .qf_question_tile.variant-text-identity {
      padding-bottom: none;
    }

    .qf_question_tile.qf_question_text_variant_short {
      display: flex;
      flex-direction: row;
      align-items: center;
      /** one line */
    }

    .qf_question_tile.qf_question_text_variant_short label::after {
      content: ':';
    }

    .qf_question_tile.qf_question_text_variant_short input {
      font-size: var(--font-size-question);
      margin-left: 4px;
    }

    .qt_label {
      font-weight: bold;
      font-size: var(--font-size-question);
      display: block;
      margin-bottom: 8px;
    }

    label {
      margin-left: 4px;
    }

    input[type="radio"] {
      accent-color: var(--color-accent);
      appearance: none;
      transform: scale(1.5);
    }

    input[type="radio"]::before {
      content: '🔘';
      /* font-size: 20px; */
    }

    input[type="radio"]:checked::before {
      content: '🎯';
    }

    .btn_tray {
      display: flex;
      justify-content: center;
      gap: 6px;
      width: 100%;
    }

    button[type="submit"] {
      display: block;
      width: 40%;
      padding: var(--padding-button);
      font-size: var(--font-size-base);
      background-color: var(--color-accent);
      color: var(--color-button-text);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button[type="submit"]:hover {
      background-color: var(--color-accent-hover);
    }

    button[type="reset"] {
      display: block;
      width: 40%;
      padding: var(--padding-button);
      font-size: var(--font-size-base);
      background-color: var(--color-button-muted-bg);
      color: var(--color-button-muted);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: filter 0.2s ease;
    }

    button[type="reset"]:hover {
      filter: brightness(0.9);
    }
  </style>
</head>

<body>
  <form action="/q/score" method="POST">
    <?php

    // dynamically generate question elements
    // formatting is nice

    $quizId = $_GET['id'] ?? null;
    $questions = [];

    if ($quizId) {
      $ch = curl_init("http://localhost:4006/api/quiz/questions/$quizId");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $response = curl_exec($ch);
      curl_close($ch);

      if ($response) {
        $data = json_decode($response, true);
        if (isset($data['questions']) && is_array($data['questions'])) {
          $questions = $data['questions'];
        }
      }
    }

    // generate the form fields
    $i = 1; // question counter

    echo "<div class='qf_question_tile qf_question_text_variant_short variant-text-identity'><label for='uname' class='qt_label'>Your name</label><input type='text' name='uname' required></div>"; // user name

    foreach ($questions as $q) {

      echo "<div class='qf_question_tile' id='qw_$i'>"; // opening: div
      echo "<label for='q$i' class='qt_label'>" . $q["question"] . "</label>"; // question tile label
      // echo "<br>";
      switch ($q["type"]) {
        // Internally this maps into an enum. it is the MultiChoice type
        case 0:
          $c = 1; // choice counter
          foreach ($q["answerChoices"] as $p) {
            echo "<input type='radio' name='q$i' value='$c' id='q$i\_$c' required>"; // records which client picks, value is gonna be nth choice
            echo "<label for='q$i\_$c'>" . $p . "</label>";

            echo "<br>";
            $c++; // increment
          }
          break;
        case 1:
          echo "<textarea name='q$i' id='q$i' rows='10'></textarea>";
      }
      echo "</div>";
      echo "<br>";
      $i++;
    }
    ?>
    <div class="btn_tray">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>
  </form>

  <script src="../hot-reload-client.js"></script>
</body>