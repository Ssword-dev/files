<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            background: 
                <?php
                $num = $_POST['num'];
                if ($num === ''){
                    echo '#ffffff';
                }
    
                else if ($num < 0){
                    echo '#ff0000';
                }
    
                else {
                    echo '#00ff00';
                }
         ?>;
        }
    </style>
</head>
<body>
    <form action="" method="POST">
        <label for="num">Enter a number here</label>
        <input type="number" name="num">
        <button type="submit">Submit</button>
    </form>
</body>
</html>