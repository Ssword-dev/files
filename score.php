<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    if ($_SERVER['REQUEST_METHOD'] != "POST") {
        echo "Please do not attempt to view a score illegitimately";
        die(1);
    }

    $score = 0; // accumulative value
    $answers = [1, 1, 3, 2, 1, 3, 3, 1, 1, 4];

    foreach (range(1, 10) as $i) {
        if (isset($_POST["q$i"]) && $_POST["q$i"] == $answers[$i - 1]) {
            $score++;
        }
    }

    echo "Score: $score/10";
    ?>
</body>

</html>