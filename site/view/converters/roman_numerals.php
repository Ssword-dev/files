<?php

class RomanConverter
{

    private function __construct()
    {
    }

    /**
     * an associative array mapping translation:value pairs.
     * @var array
     */
    private static array $map = [
        'M' => 1000,
        'CM' => 900,
        'D' => 500,
        'CD' => 400,
        'C' => 100,
        'XC' => 90,
        'L' => 50,
        'XL' => 40,
        'X' => 10,
        'IX' => 9,
        'V' => 5,
        'IV' => 4,
        'I' => 1,
    ];

    // convert int -> roman
    public function toRoman(int $num): string
    {
        if ($num <= 0 || $num > 1000) {
            throw new InvalidArgumentException("Number must be between 1 and 1000");
        }

        $result = '';
        foreach (RomanConverter::$map as $roman => $value) {
            while ($num >= $value) {
                $result .= $roman;
                $num -= $value;
            }
        }
        return $result;
    }

    // convert roman -> int
    public static function fromRoman(string $roman): int
    {
        $roman = strtoupper(trim($roman));

        // variables to track
        $i = 0;
        $value = 0;

        // iterates through the map
        foreach (RomanConverter::$map as $symbol => $nv) {
            // if the symbol is in the range [i, i+strlen($symbol)]
            // then add its value.
            while (substr($roman, $i, strlen($symbol)) === $symbol) {
                $value += $nv;
                $i += strlen($symbol);
            }
        }

        return $value;
    }

    // singleton pattern
    // internal instance
    private static ?RomanConverter $_instance = null;

    // provide a way to access from other classes.
    public static function instance(): RomanConverter
    {
        if (RomanConverter::$_instance === null) {
            RomanConverter::$_instance = new RomanConverter();
        }
        return RomanConverter::$_instance;
    }
}

class AppState
{
    /**
     * Any throwable or null if not set.
     * This is what gets thrown if App::throwLastException.
     * @var ?Throwable
     */
    public ?Throwable $exc = null;

    /**
     * Any string input from the user. should be null on
     * empty. 
     * @var ?string
     */
    public ?string $rawStringInput = null;

    /**
     * The raw processed int input. should be null when
     * raw string input is null (dependency).
     * @var ?int
     */
    public ?int $rawIntInput = null;

    /**
     * this is a flag to track if the current set input
     * is empty
     * @var bool
     */
    public bool $empty = false;

    public function __construct()
    {
    }
}

class App
{
    /**
     * The internal state of this application. this is where
     * mutation goes.
     * @var AppState
     */
    private AppState $state;

    /**
     * A roman converter. Converts things to roman numerals.
     * @var RomanConverter
     */
    private RomanConverter $romanConverter;

    /**
     * Constructor for the app class.
     */
    public function __construct()
    {
        $this->state = new AppState();

        // invoke singleton
        $this->romanConverter = RomanConverter::instance();
    }

    /**
     * Sets the current state's input to the new user input.
     * @param string $userInput The user input.
     * @return void
     */
    public function setInput(string $userInput)
    {
        $trimmedInput = trim($userInput);

        if ($trimmedInput === '') {
            // spec: this handles empty inputs which sets the values to
            // the 'null' mode which is basically just it being empty.
            $this->state->empty = true;
            $this->state->rawStringInput = null;
            $this->state->rawIntInput = 0;

            return;
        }

        $this->state->rawStringInput = $userInput; // this is raw. not trimmed.

        try {
            $integerInput = (int) ($trimmedInput);

            // if we got here then that means the cast did not fail.
            // this means it is a valid integer string.
            $this->state->rawIntInput = $integerInput;
        } catch (Throwable $exception) {
            $this->state->rawIntInput = null; // sign an error occured
            $this->state->exc = $exception;
        }
    }

    public function displayResult()
    {
        // if the value is not an integer then say invalid.
        if (!is_int($this->state->rawIntInput)) {
            return "Invalid.";
        }

        // if there is no value, then tell the user to put something.
        if ($this->state->empty) {
            return "Please input something.";
        }

        // if the int input is not malformed. then convert and display
        if ($this->state->rawIntInput !== null) {
            return (string) $this->romanConverter->toRoman($this->state->rawIntInput);
        }

        // else if it is malformed, get the exc (Throwable) from the
        // current state.
        else {
            if ($this->state->exc !== null) {
                return $this->state->exc->getMessage();
            } else {
                return "An unknown error has occured.";
            }
        }
    }

    /**
     * Provides access to internal state rawStringInput
     * @return ?string
     */
    public function getRawInput()
    {
        return $this->state->rawStringInput;
    }

    /**
     * Throws the last exception.
     * @return void
     */
    public function throwLastException()
    {
        if ($this->state->exc !== null) {
            throw $this->state->exc;
        }
    }
}

// create the app
$app = new App();

// if user provided an input. set the input state.
if (isset($_POST['number-input'])) {
    $app->setInput($_POST['number-input']);
} else {
    // something else here. idk.
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <!-- defines the character set (charset). UTF-8 basically means normal stuff-->
    <meta charset="UTF-8" />

    <!-- metadata bout this page -->
    <meta name="author" content="ssword-dev">
    <meta name="description" content="a utility tool that helps you convert numbers to roman numerals">

    <!--
    DO NOT REMOVE THIS, without this, vh and vw wont work. w-screen and h-screen also wont work.
    well actually it may work but some devices spoof the width without this.
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Roman Numeral Converter</title>
    <link rel="stylesheet" href="../../static/css/index.css" />
</head>

<body class="bg-muted h-screen w-screen">
    <!-- root wrapper (box model frame variation) -->
    <div
        class="flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full w-full p-6">
        <main id="main-content" class="flex flex-col justify-center items-center h-full w-full">
            <!-- card preset container -->
            <div data-preset="card"
                class="self-center min-h-3/5 h-fit w-full max-w-2xl bg-primary rounded-2xl shadow-xl overflow-hidden border border-slate-700">

                <h1 class="card-title text-center text-3xl font-bold py-6 bg-slate-950/70">
                    Roman Numeral Converter
                </h1>

                <div class="card-body p-8 flex flex-col gap-10">
                    <!-- input form -->
                    <form class="action-input flex flex-row justify-center" method="POST">
                        <input name="number-input" id="number-input" type="number" min="0" max="1000"
                            class="flex-1 border border-slate-600 bg-slate-800 text-white rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter number..."
                            value="<?= htmlspecialchars((string) ($app->getRawInput() ?? '')) ?>"
                            aria-label="Enter a number to convert" />

                        <button data-preset="button" type="submit"
                            class="bg-blue-600 hover:bg-blue-500 transition-colors border border-slate-600 border-l-0 rounded-r-lg px-4 py-2 flex items-center justify-center"
                            aria-label="Convert number to Roman numeral">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-arrow-down-up" role="img" aria-hidden="true">
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                            </svg>
                        </button>
                    </form>

                    <!-- result output -->
                    <section class="flex flex-col justify-center items-center w-full min-h-[160px] gap-4">
                        <span id="result-output"
                            class="text-[4rem] font-extrabold text-center text-amber-300 select-none cursor-pointer drop-shadow-lg hover:scale-105 transition-transform leading-none"
                            title="Click to copy result" onclick="navigator.clipboard.writeText(this.innerText);">
                            <?= $app->displayResult() ?>
                        </span>

                        <!-- fun facts -->
                        <div class="text-sm text-slate-300 text-center max-w-md italic">
                            <p>Fun fact: The Romans didn&#x2019;t have a symbol for zero.</p>
                            <p>Another one: IV and IX are examples of subtractive notation, where a smaller numeral
                                before a
                                larger one means subtraction.</p>
                            <p>Also: There is no standard notation for 3900+</p>
                        </div>
                    </section>

                    <!-- source link -->
                    <section
                        class="flex flex-col justify-center items-center w-full text-center border-t border-slate-700 pt-6">
                        <p class="mb-2 text-slate-300">This is possible because of this source code:</p>
                        <a href="https://github.com/Ssword-dev/files/blob/d4149e47c55ebe882df2ea48395e31e8d1361b49/site/view/converters/roman_numerals.php"
                            target="_blank" rel="noopener noreferrer"
                            class="hover:text-accent underline underline-offset-4 transition-colors">
                            Click to go to Source
                        </a>
                    </section>
                </div>
        </main>
    </div>


    <!-- dev hot reload -->
    <script src="../../hot-reload-client.js"></script>
</body>

</html>