<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link href="./commons/tailwind-dist.css">
    <style>
        :root {
            --font-family: sans-serif;
            --font-size-base: 1rem;
            --font-size-question: 1.1rem;

            --color-bg: #f4f4f4;
            --color-text: #222;
            --color-card-bg: #ffffff;
            --color-border: #ddd;
            --color-accent: #007BFF;
            --color-accent-hover: #0056b3;
            --color-button-text: #ffffff;
            --color-button-muted-bg: #000000;
            --color-button-muted: #ffffff;

            --padding-form: 24px;
            --padding-button: 12px;

            --max-width: 600px;
            --border-radius: 8px;
            --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            --spacing-question: 24px;
        }

        body {
            font-family: var(--font-family);
            background-color: var(--color-bg);
            margin: 0;
            padding: 0;
            color: var(--color-text);
        }

        form {
            display: flex;
            flex-direction: column;
            max-width: var(--max-width);
            margin: 40px auto;
            padding: var(--padding-form);
            background-color: var(--color-card-bg);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }

        .qf_question_tile {
            margin-bottom: var(--spacing-question);
            padding-bottom: 16px;
            border-bottom: 1px solid var(--color-border);
        }

        .qf_question_tile.qf_question_text_variant {
            display: flex;
            flex-direction: row;
            /** one line */
        }

        .qf_question_tile.qf_question_text_variant label::after {
            content: ':';
        }

        .qf_question_tile.qf_question_text_variant input {
            font-size: 0.7rem;
        }

        .qt_label {
            font-weight: bold;
            font-size: var(--font-size-question);
            display: block;
            margin-bottom: 8px;
        }

        label {
            margin-left: 4px;
        }

        input[type="radio"] {
            accent-color: var(--color-accent);
            appearance: none;
            transform: scale(1.5);
        }

        input[type="radio"]::before {
            content: '🔘';
            /* font-size: 20px; */
        }

        input[type="radio"]:checked::before {
            content: '🎯';
        }

        .btn_tray {
            display: flex;
            justify-content: center;
            gap: 6px;
            width: 100%;
        }

        button[type="submit"] {
            display: block;
            width: 40%;
            padding: var(--padding-button);
            font-size: var(--font-size-base);
            background-color: var(--color-accent);
            color: var(--color-button-text);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        button[type="submit"]:hover {
            background-color: var(--color-accent-hover);
        }

        button[type="reset"] {
            display: block;
            width: 40%;
            padding: var(--padding-button);
            font-size: var(--font-size-base);
            background-color: var(--color-button-muted-bg);
            color: var(--color-button-muted);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: filter 0.2s ease;
        }

        button[type="reset"]:hover {
            filter: brightness(0.9);
        }
    </style>
</head>

<body>
    <form action="/q/score" method="POST">
        <?php

        // dynamically generate question elements
        // formatting is nice

        $questions = [
            [
                "question" => "What Celestial Body does Earth orbit?",
                "choices" => [
                    "Sun",
                    "Moon",
                    "Proxima Centauri A",
                    "Proxima Centauri B",
                ], // 1
            ], // Associative array for questions
            [
                "question" => "What is 2 * 5 + 3", // should be (2 * 5) + 3 or 13 because PEMDAS
                "choices" => [
                    "13",
                    "15",
                    "17",
                    "I dont know"
                ] // 1
            ],
            [
                "question" => "What does JSON stand for?",
                "choices" => [
                    "Javascript Object Notion",
                    "Java Object Notation",
                    "Javascript Object Notation",
                    "I do know know"
                ], // 3
            ],
            [
                "question" => "Is HTML a Programming Language?",
                "choices" => [
                    "Yes",
                    "No",
                    "Maybe",
                    "Idk"
                ], // 2, its a markup language
            ],
            [
                "question" => "What does 1/0 approach when expressed as 1/n as n gets infinitely closer to 0",
                "choices" => [
                    "Infinity",
                    "-Infinity",
                    "undefined",
                    "0"
                ], // 1
            ],
            [
                "question" => "How did you get the answer to no. 5?",
                "choices" => [
                    "By letting n = 0",
                    "By brute-force",
                    "By taking the limit as n of 1/n as n approaches 0",
                    "I guessed..."
                ], // 3
            ],
            [
                "question" => "What is the hex code for black?",
                "choices" => [
                    "#adadad",
                    "#ffffff",
                    "#000000",
                    "#aeaeae"
                ], // 3
            ],
            [
                "question" => "PHP stands for?",
                "choices" => [
                    "HyperText Preprocessor",
                    "Planning homepage",
                    "Planting homepage",
                    "HyperText Transfer Protocol"
                ], // 1
            ],
            [
                "question" => "What header do you send to the client to make sure it interprets it as HTML?",
                "choices" => [
                    "Content-Type: text/html",
                    "Content-Type: html",
                    "Content-Type: webpage",
                    "Content-type: site"
                ], // 1
            ],
            [
                "question" => "What does HTTP stand for?",
                "choices" => [
                    "HyperText Transmission Protocol",
                    "HyperText Testing Protocol",
                    "HyperText Transmit Protocol",
                    "HyperText Transfer Protocol"
                ], // 4
            ]

        ];

        // generate the form fields
        $i = 1; // question counter

        echo "<div class='qf_question_tile qf_question_text_variant'><label for='uname' class='qt_label'>Your name</label><input type='text' name='uname' required></div>"; // user name

        foreach ($questions as $q) {
            $c = 1; // choice counter
            echo "<div class='qf_question_tile' id='qw_$i'>"; // opening: div
            echo "<label for='q$i' class='qt_label'>" . $q["question"] . "</label>"; // question tile label
            // echo "<br>";

            foreach ($q["choices"] as $p) {
                echo "<input type='radio' name='q$i' value='$c' id='q$i\_$c' required>"; // records which client picks, value is gonna be nth choice
                echo "<label for='q$i\_$c'>" . $p . "</label>";

                echo "<br>";
                $c++; // increment
            }
            echo "</div>";
            echo "<br>";
            $i++;
        }
        ?>
        <div class="btn_tray">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <script src="/q/commons.js" async defer></script>
    <script src="./hot-reload-client.js"></script>
</body>

</html>