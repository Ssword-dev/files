<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Score</title>
    <link rel="stylesheet" href="/q/commons.css">
    <style>
        :root {
            --font-family: sans-serif;
            --font-size-base: 1rem;

            --color-bg: #f4f4f4;
            --color-text: #222;
            --color-card-bg: #ffffff;
            --color-border: #ddd;
            --color-accent: #007BFF;
            --color-accent-hover: #0056b3;
            --color-button-text: #ffffff;

            --padding-card: 24px;
            --max-width: 500px;
            --border-radius: 8px;
            --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--color-bg);
            font-family: var(--font-family);
            color: var(--color-text);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .score-card {
            background-color: var(--color-card-bg);
            padding: var(--padding-card);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            max-width: var(--max-width);
            width: 90%;
            text-align: center;
        }

        .score-card h1 {
            font-size: 1.8rem;
            margin-bottom: 12px;
        }

        .score-card .score {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--color-accent);
        }

        .error {
            padding: 2rem;
            font-size: 1.2rem;
            color: crimson;
            text-align: center;
        }
    </style>
</head>

<body>
    <?php
    if ($_SERVER['REQUEST_METHOD'] != "POST") {
        echo "<div class='error'>Please do not attempt to view a score illegitimately.</div>";
        die(1);
    }

    $score = 0;
    $answers = [1, 1, 3, 2, 1, 3, 3, 1, 1, 4];

    foreach (range(1, 10) as $i) {
        if (isset($_POST["q$i"]) && $_POST["q$i"] == $answers[$i - 1]) {
            $score++;
        }
    }

    $name = $_POST['uname'];

    echo "
    <div data-preset='card' class='score-card'>
        <h1 class='card-title'>Your Score ($name)</h1>
        <div class='card-body score'>$score / 10</div>
        <div class='card-footer-notice'>Note that this is not an official quiz</div>
    </div>";
    ?>
</body>

</html>