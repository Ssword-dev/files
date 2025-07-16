<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
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
                    "Proxima Centauri B"
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
        
        foreach ($questions as $q) {
            $c = 1; // choice counter
            echo "<div class='qf_question_tile' id='qw_$i'>"; // opening: div
            echo "<label for='q$i' class='qt_label'>" . $q["question"] . "</label>"; // question tile label
            echo "<br>";

            foreach ($q["choices"] as $p) {
                echo "<input type='radio' name='q$i' value='$c' id='q$i\_$c'>"; // records which client picks, value is gonna be nth choice
                echo "<label for='q$i\_$c'>" . $p . "</label>";

                echo "<br>";
                $c++; // increment
            }
            echo "</div>";
            echo "<br>";
            $i++;
        }
        ?>
        <button type="submit">Submit</button>
    </form>
</body>

</html>