<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'alexpocd_alextec';
$user = 'alexpocd_alextec';
$pass = 'YOUR_DB_PASSWORD';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Товар не найден']);
        exit;
    }
    $product['price'] = (float)$product['price'];
    $product['oldPrice'] = $product['oldPrice'] ? (float)$product['oldPrice'] : null;
    $product['rating'] = (float)$product['rating'];
    $product['reviews'] = (int)$product['reviews'];
    $product['imageUrl'] = 'http://' . $_SERVER['HTTP_HOST'] . '/assets/images/' . $product['image'];
    echo json_encode(['success' => true, 'data' => $product], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>