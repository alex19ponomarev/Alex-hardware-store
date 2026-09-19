<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$db   = 'alexpocd_alextec';
$user = 'alexpocd_alextec';
$pass = 'YOUR_DB_PASSWORD';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database Error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt = $pdo->query("SELECT id, name, price, image_path FROM productshome");
$products = $stmt->fetchAll();

$response = array_map(function($product) {
    return [
        'id'     => (int)$product['id'],
        'name'   => $product['name'],
        'price'  => (float)$product['price'],
        'image'  => '/assets/images/' . $product['image_path']
    ];
}, $products);

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>