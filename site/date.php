<?php

if (isset($_GET["d"])){
    // code
}
$value = $_GET["d"];


function GetDay(int $index)
{

    switch ($index) {
        case 1:
            return "Sunday";
        case 2:
            return "Monday";
        case 3:
            return "Tuesday";
        case 4:
            return "Wednesday";
        case 5:
            return "Thursday";
        case 6:
            return "Friday";
        case 7:
            return "Saturday";
        default:
            return "Invalid";
    }
    ;
}

echo GetDay($value);