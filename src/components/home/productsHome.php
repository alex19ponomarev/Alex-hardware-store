<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$db   = 'alextechstoredatebei';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);


    $checkStmt = $pdo->query("SHOW TABLES LIKE 'productshome'");
    if ($checkStmt->rowCount() === 0) {
        throw new Exception("Таблица 'productshome' не найдена в базе данных '$db'. Создайте её.");
    }


    $stmt = $pdo->query("SELECT id, name, price, image_path FROM productshome");
    $products = $stmt->fetchAll();

    $response = array_map(function($product) {
        $imagePath = !empty($product['image_path']) ? $product['image_path'] : 'placeholder.png';
        return [
            'id'     => (int)$product['id'],
            'name'   => $product['name'],
            'price'  => (float)$product['price'],
            'image'  => '/assets/images/' . $imagePath 
        ];
    }, $products);

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error'   => 'Database Error',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error'   => 'Server Error',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>