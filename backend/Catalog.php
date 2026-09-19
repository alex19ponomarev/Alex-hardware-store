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
    $stmt = $pdo->query('SELECT * FROM products');
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($products as &$p) {
        $p['price'] = (float)$p['price'];
        $p['oldPrice'] = $p['oldPrice'] ? (float)$p['oldPrice'] : null;
        $p['rating'] = (float)$p['rating'];
        $p['reviews'] = (int)$p['reviews'];
        $p['imageUrl'] = 'http://' . $_SERVER['HTTP_HOST'] . '/assets/images/' . $p['image'];
    }
    echo json_encode(['success' => true, 'data' => $products], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>