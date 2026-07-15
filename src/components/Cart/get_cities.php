<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'alextechstoredatebei';

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка соединения с базой']);
    exit;
}


$result = $conn->query("SELECT DISTINCT city_name FROM cities");
$cities = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $cities[] = $row['city_name'];
    }
}

$conn->close();

echo json_encode($cities);
?>