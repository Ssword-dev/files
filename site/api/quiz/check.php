<?php



header("Content-Type: application/json");

// helper to respond with error and exit
function respondError(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode([
        "type" => "error",
        "message" => $message,
    ]);
    exit;
}

// helper to safely get a key from an array, or null if missing
function getArrayKey(array $arr, string $key)
{
    return $arr[$key] ?? null;
}

// parse input JSON body
$rawInput = file_get_contents("php://input");
$jsonBody = json_decode($rawInput, true);

if ($jsonBody === null) {
    respondError("Invalid JSON format.");
}

$id = getArrayKey($jsonBody, "id");
if (empty($id) || !is_string($id)) {
    respondError("Missing or invalid 'id'.");
}

// reflect through question api. (the c# one)
$url = "http://localhost:4006/api/quiz/questions/" . urlencode($id);

$ch = curl_init($url);
if (!$ch) {
    respondError("Internal Server Error (failed to initialize request).", 500);
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$responseBody = curl_exec($ch);

if ($responseBody === false) {
    respondError("Internal Server Error (failed to fetch questions).", 500);
}

$responseJson = json_decode($responseBody, true);
if ($responseJson === null || !isset($responseJson['questions']) || !is_array($responseJson['questions'])) {
    respondError("Invalid response from questions API.", 500);
}

$questions = $responseJson['questions'];

$responses = getArrayKey($jsonBody, "responses");
if (empty($responses) || !is_array($responses)) {
    respondError("Missing or invalid 'responses'.");
}

$score = 0;
$output = [];

// loop through all the user responses, one by one
foreach ($responses as $index => $response) {
    if (!isset($questions[$index]) || !is_array($response)) {
        continue;
    }

    // grab the type and the actual answer value
    $type = getArrayKey($response, "type");
    $value = getArrayKey($response, "value");

    if ($type === null) {

    }

    $question = $questions[$index];

    switch ($type) {
        case 0: // multiple choice, easy probability...
            if ($value === $question['correctAnswerIndex']) {
                $score++; // user probably guessed... or not...
            }
            break;

        case 1:
            $score++; // user tried. +score because they are awesome (:
            break;

        case 2: // short answer, this is where it gets tricky
        case 3: // long answer, same deal but more words probably
            // if there are no answers to check against, just bail out
            if (!isset($question['answers']) || !is_array($question['answers'])) {
                break; // nothing to do here, move along
            }

            // loop through all possible correct answers
            foreach ($question['answers'] as $answer) {
                $trimmedValue = trim($value);
                $trimmedAnswer = trim($answer);
                if (!empty($question['ignoreCase'])) {
                    if (strtolower($trimmedAnswer) === strtolower($trimmedAnswer)) {
                        $score++;
                        break;
                    }
                } else {
                    if ($trimmedAnswer === $trimmedValue) {
                        $score++;
                        break;
                    }
                }


            }
            break;
    }
}

$output['score'] = $score;
$output['originalQuestions'] = $questions;

echo json_encode($output);
