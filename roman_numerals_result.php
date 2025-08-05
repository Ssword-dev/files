<?php

function toRomanOnes($number) {
    $current = $number % 10; // get oneth place
    switch($current){
                case 0:
            break;
        case ($current <= 3):
            return str_repeat("I", $current);
        case 4:
            return "IV";
        case 9:
            return "IX";
        case ($current >= 5):
            return "V" . str_repeat("I", $current - 5);
    }
}

function toRoman($number)
{
    $roman = "";
    $current = $number;

    if (ceil($number) != $number) {
        return null;
    }

    if ($number < 89) {
        $tenths = floor($current / 10);

        // handle tenth's case

        switch($tenths) {
            case ($tenths >= 1 && $tenths <= 3):
                $roman .= str_repeat("X", $tenths);
                break;
            case (4):
                $roman .= "XL ";
                break;
            case ($tenths >= 5 && $tenths <= 8):
                $roman .= "L" . str_repeat("X", $tenths - 5);
                break;
        }

        $roman .= toRomanOnes($current) . "<br>";
    }

    else {
        // greater than 90
        return "XC " . toRomanOnes($current);
    }

    return $roman;
}

if (isset($_GET["n"])) {
    $n = $_GET["n"];
    $o = toRoman($n - 0);
    echo "<p style='color:red'>$o</p>";
}