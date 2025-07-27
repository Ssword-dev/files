<?php

define('PAYMENTS_DB_HOST', 'localhost');
define('PAYMENTS_DB_USER', 'root');
define('PAYMENTS_DB_PASSWORD', '');
define('FETCH_ALL_PAYMENTS', 'SELECT * FROM `payments`');
define('PAYMENTS_DB', 'quejadadb');
$conn = mysqli_connect(PAYMENTS_DB_HOST, PAYMENTS_DB_USER, PAYMENTS_DB_PASSWORD, PAYMENTS_DB);

if (!$conn) {
    echo "Cannot connect with the database";
    die(1);
}

$stmt = $conn->prepare(FETCH_ALL_PAYMENTS);


if (!$stmt) {
    echo "Cannot prepare statements";
    die(1);
}

$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while (true) {
        $current_record = $result->fetch_assoc();
        if (!$current_record) {
            break;
        }
        echo $current_record["name"] . "Paid with ₱" . $current_record["amount"] . " in date " . $current_record["issued_at"] . " for " . $current_record["reason"];
    }
}