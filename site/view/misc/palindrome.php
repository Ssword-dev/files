<?php

// this page is fully SSR-based. unlike the quiz
// view one which is partial SSR+client work.

class PalindromeTester
{
    public array $whiteSpaceCharacters = [' ', "\n", "\r", "\t", "\v"];

    public function __construct()
    {
    }

    public function stripAllWhiteSpaces(string $input): string
    {
        return str_replace($this->whiteSpaceCharacters, '', $input);
    }

    public function icasecmp(string $s1, string $s2): bool
    {
        return strtolower($s1) === strtolower($s2);
    }

    public function test(string $input): bool
    {
        $spInput = $this->stripAllWhiteSpaces($input);
        $sprInput = $this->stripAllWhiteSpaces(strrev($input));

        return $this->icasecmp($spInput, $sprInput);
    }
}

class AppState
{
    public ?Throwable $exc = null;
    public ?string $rawStringInput = null;
    public bool $empty = false;

    public function __construct()
    {
    }
}

class App
{
    private AppState $state;
    private PalindromeTester $palindromeTester;

    public function __construct()
    {
        $this->state = new AppState();
        $this->palindromeTester = new PalindromeTester();
    }

    public function setInput(string $userInput): void
    {
        $trimmedInput = trim($userInput);

        if ($trimmedInput === '') {
            $this->state->empty = true;
        }

        $this->state->rawStringInput = $userInput;
    }

    public function displayResult(): string
    {
        $input = $this->state->rawStringInput;

        if ($this->state->empty || $input === null) {
            return <<<HTML
                <!-- There is only emptiness. -->
                <span>input something.</span>
                HTML;
        }

        $isPalindrome = $this->palindromeTester->test($input);
        return $isPalindrome
            ?
            <<<HTML
            <!-- This is a palindrome -->
            <span class='text-5xl font-bold text-green-600'>It is a Palindrome</span>
            HTML
            :
            <<<HTML
            <!-- This is not a palindrome -->
            <span class='text-5xl font-bold text-red-600'>Not a Palindrome</span>
            HTML;
    }

    public function displayFunFacts(): string
    {
        return <<<HTML
            <ul class="mt-4 text-sm italic text-gray-600 space-y-1">
                <li>Did you know? "racecar" and "madam" are classic palindromes.</li>
                <li>The word "palindrome" comes from Greek roots meaning "running back again".</li>
                <li>Even numbers can be palindromes: 12321, 4554.</li>
                <li>Fun fact: The year 2002 was a palindrome year!</li>
            </ul>
        HTML;
    }

    public function getRawInput(): ?string
    {
        return $this->state->rawStringInput;
    }

    public function throwLastException(): void
    {
        if ($this->state->exc !== null) {
            throw $this->state->exc;
        }
    }
}

$app = new App();

if (isset($_POST['word-input'])) {
    $app->setInput($_POST['word-input']);
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Palindrome Checker</title>
    <link rel="stylesheet" href="../../static/css/index.css" />
</head>

<body class="bg-muted h-screen w-screen">
    <div id="root" class="flex flex-col items-center justify-center bg-secondary h-full w-full">

        <main id="main-content" class="flex flex-col justify-center align-center h-full w-full">
            <div data-preset="card" class="self-center h-3/5 w-3/5 bg-primary shadow-lg rounded-xl p-6">
                <h1 class="card-title text-2xl font-bold mb-4 text-center">Palindrome Checker</h1>

                <form class="action-input flex flex-row justify-center mb-6" method="POST">
                    <input name="word-input" id="word-input" type="text" placeholder="Enter a word or phrase..."
                        class="flex-1 border border-gray-400 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value="<?= htmlspecialchars((string) ($app->getRawInput() ?? '')) ?>" />

                    <button type="submit"
                        class="bg-accent hover:brightness-highlight text-white border border-gray-400 border-l-0 rounded-r px-4 py-2 flex items-center justify-center">
                        Check
                    </button>
                </form>

                <div class="text-center">
                    <!-- shorthands for echoing the result. -->
                    <?= $app->displayResult() ?>
                    <?= $app->displayFunFacts() ?>
                </div>
            </div>
        </main>
    </div>

    <script src="../../hot-reload-client.js"></script>
</body>

</html>