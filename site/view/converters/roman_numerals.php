<?php
$ex = null; // Throwable | null
$n = null; // int | null

if (isset($_POST['number-input'])) {
    try {
        $unsafeInt = (int) $_POST['number-input'];

        if (100 < $unsafeInt || $unsafeInt <= 0) {
            throw new RangeException("Input must be 1 and above but less than 100");
        } else {
            $n = $unsafeInt;
        }
    } catch (Throwable $e) {
        $n = null;
        $ex = $e;
    }
}
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

        <main id="main-content" class="flex h-4/5 w-4/5 gap-6 p-6">

            <!-- left panel: form -->
            <section class="
            flex-1 flex flex-col justify-center to-r p-4 rounded shadow
            bg-gradient-to-r from-primary to-blend
            ">
                <form id="number-to-roman-converter" class="flex flex-col gap-4" method="POST">
                    <div class="action-input flex flex-row">
                        <input name="number-input" id="number-input" type="number" min="0" max="1000"
                            class="flex-1 border border-gray-400 rounded-l px-2 py-1"
                            value="<?= htmlspecialchars((string) $n ?? '') ?>" />
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
            </section>

            <!-- right panel: output -->
            <section class="
            flex-1 flex items-center justify-center p-4 rounded shadow
            bg-gradient-to-l from-primary to-blend
            ">
                <div id="roman-output" class="text-3xl font-bold text-center">
                    <?php
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

                    if ($n !== null) {
                        echo toRoman($n);
                    } elseif ($n === "") {
                        echo "Enter a number and click the icon.";
                    } else {
                        if ($ex !== null) {
                            echo $ex->getMessage();
                        } else {
                            echo "An unknown error has occured.";
                        }
                    }
                    ?>
                </div>
            </section>

        </main>
    </div>

    <!-- dev hot reload -->
    <script src="../../hot-reload-client.js"></script>
</body>

</html>