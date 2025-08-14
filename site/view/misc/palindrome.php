<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Palindrome Checker</title>
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
                    <div class="labeled-input flex flex-col gap-2">
                        <label for="number-input" class="font-medium">Enter a number...</label>
                        <input name="number-input" id="number-input" type="number" min="0" max="1000"
                            class="border border-gray-400 rounded px-2 py-1" />
                    </div>
                    <button type="submit">
                        <!-- i copied this icon from lucide. they got great stuff (: -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-arrow-down-up-icon lucide-arrow-down-up">
                            <path d="m3 16 4 4 4-4" />
                            <path d="M7 20V4" />
                            <path d="m21 8-4-4-4 4" />
                            <path d="M17 4v16" />
                        </svg>
                        <span>Convert</span>
                    </button>
                </form>
            </section>

            <!-- right panel: output -->
            <section class="
            flex-1 flex items-center justify-center p-4 rounded shadow
            bg-gradient-to-l from-primary to-blend
            ">
                <div id="roman-output" class="text-3xl font-bold text-center">
                    <!-- Output will be displayed here -->
                </div>
            </section>

        </main>
    </div>

    <!-- dev hot reload -->
    <script src="../../hot-reload-client.js"></script>
</body>

</html>