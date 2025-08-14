<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

  <link rel="stylesheet" href="../../static/css/index.css">
  <link rel="stylesheet" href="../../static/css/quiz/view.css">
</head>

<body class="flex flex-col justify-center align-center h-screen w-screen">
  <div id="form-body" class="flex flex-col justify-center align-center h-screen w-screen">
    <!-- <div id="identity">
      <div class="identity-text-field">
        <label for="identity-field-name" class="identity-text-field-label">Your Name</label>
        <input type="text" id="identity-field-name" class="identity-text-field-input">
      </div>
    </div> -->
    <div id="display-container" class="flex flex-col gap-3 self-center w-4/5 sm:w-5/6 h-4/5 sm:5/6">
      <!-- javascript will insert elements here -->
    </div>

  </div>

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
  <script src="../../static/js/view/quiz/view-page/page.js" type="module" async></script>
  <script src="../../hot-reload-client.js"></script>
</body>