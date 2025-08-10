<?php

$CONVERSION_CONFIG = [
    "lookup" => [
        "normal" => [
            1000 => "M",
            900 => "CM",
            500 => "D",
            400 => "CD",
            100 => "C",
            90 => "XC",
            50 => "L",
            40 => "XL",
            10 => "X",
            9 => "IX",
            5 => "V",
            4 => "IV",
            1 => "I",
        ],
        "extended" => [
            // dynamic
        ],
    ]
];

// assume 32 bit
// the result will be ((M))
$range_end = 2;

// if 64 bit or higher (if there is such arch.)
// then end on 5
// the result will be (((((M)))))
if (PHP_INT_SIZE <= 8) {
    $range_end = 5;
}

foreach ($CONVERSION_CONFIG['lookup']['normal'] as $val => $sym) {
    $normal = $CONVERSION_CONFIG['lookup']['normal'][$val];

    $CONVERSION_CONFIG['lookup']['extended'][$val] = $sym;

    if (
        $val === 1 // 1 cannot be extended in this notation.
    ) {
        continue;
    }

    foreach (range(1, $range_end) as $i) {
        $newVal = $val * (1000 ** $i);
        $opening = str_repeat("(", $i);
        $closing = str_repeat(")", $i);

        $CONVERSION_CONFIG['lookup']['extended'][$newVal] = $opening . $sym . $closing;
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="../../static/css/index.css">
</head>

<body>
    <div id="form-body">

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
        <?= json_encode($CONVERSION_CONFIG) ?>
  </script>
    <script src="../../hot-reload-client.js"></script>
</body>