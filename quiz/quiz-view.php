<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

  <link rel="stylesheet" href="../static/css/index.css">
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

    /* .qt_label {
      font-weight: bold;
      font-size: var(--font-size-question);
      display: block;
      margin-bottom: 8px;
    } */

    label {
      margin-left: 4px;
    }

    input[type="radio"] {
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
    <div id="identity">
      <div class="identity-text-field">
        <label for="identity-field-name" class="identity-text-field-label">Your Name</label>
        <input type="text" id="identity-field-name" class="identity-text-field-input">
      </div>
    </div>
    <div id="questions" class="flex flex-col gap-3">
      <!-- javascript will insert elements here -->
    </div>
    <div class="btn_tray">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>
  </form>

  <!--
  This is actual partial rerendering data. because the client has
  less "bandwidth" (assumed so. so it can work on clients of like weak signal
  i think)
  this data gets transmitted to the client. the answer key is not
  included because... thats just gonna be an easy way to spoof
  answers... like... you just have to know json.
  -->
  <script type="application/json" id="server-prerender-data">
    <?php
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
          $stack = [];
          foreach ($questions as $q) {
            $newQuestion = [];

            foreach ($q as $key => $val) {
              if ($key === 'answer') {
                continue; // skip 'answer' key
              }

              $newQuestion[$key] = $val;
            }

            $stack[] = $newQuestion;
          }

          echo json_encode([
            "id" => $quizId,
            "questions" => $stack
          ]);
        }
      }
    }

    ?>
  </script>

  <!--
  This is the actual script the page uses (:
  it renders quizzes and their choices.
  -->
  <script src="../static/js/quiz-view/page.js" type="module" async></script>
  <script src="../hot-reload-client.js"></script>
</body>