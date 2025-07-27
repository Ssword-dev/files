<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        label::after {
            content: ':';
        }
    </style>
</head>
<body>
    <form action="/quejada/api/payment-issue" method="POST">
    <label for="name">Name</label>
    <input type="text" name="name">
    <label for="reason">Reason</label>
    <input type="text" name="reason">
    <label for="amount">Amount</label>
    <input type="number" name="amount">
    <button type="submit">Submit</button>
    </form>
</body>
</html>