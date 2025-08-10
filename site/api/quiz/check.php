<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');

header("Content-Type: application/json");

function respondError(string $message, int $code = 400): void
{
    http_response_code($code);
    error_log("respondError called with message: $message, code: $code");
    echo json_encode([
        "type" => "error",
        "message" => $message,
    ]);
    exit;
}

function getArrayKey(array $arr, string $key)
{
    $exists = array_key_exists($key, $arr);
    error_log("getArrayKey called for key '$key', exists: " . ($exists ? 'true' : 'false'));
    return $arr[$key] ?? null;
}

function incrementScore(): void
{
    global $score;
    $score++;
    error_log("Incrementing score... new score = $score");
}

function validateAnswer(array $question, string $userAnswer): bool
{
    $trimmedUserAnswer = trim($userAnswer);
    error_log("validateAnswer called with userAnswer='$trimmedUserAnswer'");

    if (!isset($question['answers']) || !is_array($question['answers'])) {
        error_log("Question missing 'answers' or 'answers' is not array");
        return false;
    }

    $ignoreCase = !empty($question['ignoreCase']);
    error_log("Ignore case: " . ($ignoreCase ? 'true' : 'false'));

    foreach ($question['answers'] as $answer) {
        $trimmedAnswer = trim((string) $answer);
        error_log("Checking against possible answer: '$trimmedAnswer'");
        if ($ignoreCase) {
            if (strcasecmp($trimmedAnswer, $trimmedUserAnswer) === 0) {
                error_log("Answer matched ignoring case");
                return true;
            }
        } else {
            if ($trimmedAnswer === $trimmedUserAnswer) {
                error_log("Answer matched with exact case");
                return true;
            }
        }
    }
    error_log("No answers matched");
    return false;
}

// parse input JSON body
$rawInput = file_get_contents("php://input");
error_log("Raw input JSON: " . $rawInput);

$jsonBody = json_decode($rawInput, true);
if ($jsonBody === null) {
    respondError("Invalid JSON format.");
}

error_log("Decoded JSON body: " . print_r($jsonBody, true));

$id = getArrayKey($jsonBody, "id");
error_log("Quiz id from input: " . var_export($id, true));
if (empty($id) || !is_string($id)) {
    respondError("Missing or invalid 'id'.");
}

// call questions API
$url = "http://localhost:4006/api/quiz/questions/" . urlencode($id);
error_log("Fetching questions from API URL: $url");

$ch = curl_init($url);
if (!$ch) {
    respondError("Internal Server Error (failed to initialize request).", 500);
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$responseBody = curl_exec($ch);

if ($responseBody === false) {
    $curlError = curl_error($ch);
    error_log("cURL error: $curlError");
    respondError("Internal Server Error (failed to fetch questions).", 500);
}

error_log("Received response from questions API: " . $responseBody);

$responseJson = json_decode($responseBody, true);
if ($responseJson === null || !isset($responseJson['questions']) || !is_array($responseJson['questions'])) {
    respondError("Invalid response from questions API.", 500);
}

$questions = $responseJson['questions'];
error_log("Parsed questions from API: " . print_r($questions, true));

$responses = getArrayKey($jsonBody, "responses");
error_log("User responses: " . print_r($responses, true));

if (empty($responses) || !is_array($responses)) {
    respondError("Missing or invalid 'responses'.");
}

// ensure responses are zero-based indexed array to match questions
$responses = array_values($responses);
error_log("Re-indexed responses: " . print_r($responses, true));

$score = 0;
$output = [];
$debug = [];

foreach ($responses as $index => $response) {
    error_log("Processing response at index $index: " . print_r($response, true));
    if (!isset($questions[$index]) || !is_array($response)) {
        error_log("Response index $index missing question or response is not array");
        continue;
    }

    $type = getArrayKey($response, "type");
    $value = getArrayKey($response, "value");

    error_log("Response type: " . var_export($type, true) . ", value: " . var_export($value, true));

    if ($type === null) {
        $debug[] = "$index has no type";
        error_log("Response index $index has no type");
        continue;
    }

    $question = $questions[$index];
    error_log("Corresponding question at index $index: " . print_r($question, true));

    switch ($type) {
        case 0: // multiple choice
            error_log("Handling multiple choice question");
            // cast for safe comparison
            if ((int) $value === (int) $question['correctAnswerIndex']) {
                incrementScore();
            } else {
                error_log("Wrong multiple choice answer at index $index: got $value, expected " . $question['correctAnswerIndex']);
            }
            break;

        case 1: // automatic win
            error_log("Handling automatic win question");
            incrementScore();
            break;

        case 2: // short answer
        case 3: // long answer
            error_log("Handling text answer question");
            if (validateAnswer($question, (string) $value)) {
                incrementScore();
            } else {
                $debug[] = "Answer to question $index is wrong";
                error_log("Answer mismatch at index $index: provided='" . trim((string) $value) . "'");
            }
            break;

        default:
            error_log("Unknown question type $type at index $index");
            break;
    }
}

error_log("Final score: $score");

$output['score'] = $score;
$output['originalQuestions'] = $questions;
$output['debug'] = $debug;
$output['originalResponses'] = $responses;

echo json_encode($output);
