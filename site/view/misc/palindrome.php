<?php

$exc = null;
$rawStringInput = "";
$rawIntInput = 0;
$empty = false;

function main()
{
    global $rawStringInput, $rawIntInput, $empty, $exc;
    if (isset($_POST['number-input'])) {
        $rawStringInput = $_POST['number-input'];

        if (trim($rawStringInput) == '') {
            $empty = true;
            return;
        }

        $empty = false;

        try {
            $rawIntInput = (int) $rawStringInput;
        } catch (Throwable $_exc) {
            $exc = $_exc;
        }

    }
}


function toRomanOnes($number)
{
    $current = $number % 10; // ones place

    if ($current === 0) {
        return '';
    } elseif ($current <= 3) {
        return str_repeat("I", $current);
    } elseif ($current === 4) {
        return "IV";
    } elseif ($current === 9) {
        return "IX";
    } else {
        return "V" . str_repeat("I", $current - 5);
    }
}

function toRomanTens($number)
{
    // this part is a clever trick... it gets
    // shifts the decimal part one to the right.
    // so now the ONE's place is the TENTH's place.
    $tenths = floor($number / 10) % 10; // tens place

    if ($tenths === 0) {
        return '';
    } elseif ($tenths <= 3) {
        return str_repeat("X", $tenths);
    } elseif ($tenths === 4) {
        return "XL";
    } elseif ($tenths === 9) {
        return "XC";
    } else {
        return "L" . str_repeat("X", $tenths - 5);
    }
}

function toRoman($number)
{
    if (!is_int($number) || $number < 0) {
        return null; // only non-negative integers allowed
    }

    if ($number === 100) {
        return 'C';
    }

    return toRomanTens($number) . toRomanOnes($number);

}

function displayResult()
{
    global $rawStringInput, $rawIntInput, $empty, $exc;
    if (!is_int($rawIntInput)) {
        return "Invalid.";
    }
    if ($empty) {
        return "Please input something.";
    }

    if ($rawIntInput !== null) {
        return (string) toRoman($rawIntInput);
    } else {
        if ($exc !== null) {
            return $exc->getMessage();
        } else {
            return "An unknown error has occured.";
        }
    }
}

main();
?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Roman Numeral Converter</title>
    <link rel="stylesheet" href="../../static/css/index.css" />
</head>

<body class="bg-muted h-screen w-screen [*]:outline [*]:outline-1 [*]:outline-red">
    <div id="root" class="flex flex-col items-center justify-center bg-secondary h-full w-full">

        <main id="main-content" class="flex flex-col justify-center align-center h-full w-full">

            <!-- left panel: form
            <section class="
            flex-1 flex flex-col justify-center to-r p-4 rounded shadow
            bg-gradient-to-r from-primary to-blend
            ">
                <form id="number-to-roman-converter" class="flex flex-col gap-4" method="POST">
                    <div class="action-input flex flex-row">
                        <input name="number-input" id="number-input" type="number" min="0" max="1000"
                            class="flex-1 border border-gray-400 rounded-l px-2 py-1"
                            value="<?= htmlspecialchars((string) $rawIntInput ?? '') ?>" />
                        <button type="submit"
                            class="bg-primary border border-gray-400 border-l-0 rounded-r px-3 py-1 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-arrow-down-up">
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                            </svg>
                        </button>
                    </div>
                </form>
            </section> -->

            <!-- right panel: output -->

            <div data-preset="card" class="self-center h-3/5 w-3/5 bg-primary">
                <h1 class="card-title">Roman Numeral Converter</h1>
                <div class="card-body">

                    <div class="action-input flex flex-row">
                        <input name="number-input" id="number-input" type="number" min="0" max="1000"
                            class="flex-1 border border-gray-400 rounded-l px-2 py-1"
                            value="<?= htmlspecialchars((string) $rawIntInput ?? '') ?>" />
                        <button type="submit"
                            class="bg-primary border border-gray-400 border-l-0 rounded-r px-3 py-1 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-arrow-down-up">
                                <path d="m3 16 4 4 4-4" />
                                <path d="M7 20V4" />
                                <path d="m21 8-4-4-4 4" />
                                <path d="M17 4v16" />
                            </svg>
                        </button>
                    </div>

                    <div class="card-subtext">
                        <span><?= displayResult() ?></span>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- dev hot reload -->
    <script src="../../hot-reload-client.js"></script>
</body>

</html>