<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'sales';
$username = 'root';
$password = '';

try 
{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} 
catch (PDOException $e) 
{
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
    exit;
}

try 
{
    $stmt = $pdo->query('SELECT * FROM sales_products ORDER BY id');
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . '/';
    $relativeImagePath = 'assets/images/';
    foreach ($products as &$product) {
        $product['price'] = (float)$product['price'];
        if (isset($product['oldPrice'])) 
        {
            $product['oldPrice'] = $product['oldPrice'] !== null ? (float)$product['oldPrice'] : null;
        }
        if (isset($product['discount'])) 
        {
            $product['discount'] = (int)$product['discount'];
        }
        $product['rating'] = (float)$product['rating'];
        $product['reviews'] = (int)$product['reviews'];
        if (!empty($product['image']) && is_string($product['image'])) {
            $fullFilePath = __DIR__ . '/assets/images/' . $product['image'];
            if (file_exists($fullFilePath)) {
                $encodedImageName = rawurlencode($product['image']);
                $product['imageUrl'] = $baseUrl . $relativeImagePath . $encodedImageName;
            } 
            else 
            {
                $product['imageUrl'] = $baseUrl . $relativeImagePath . 'default.jpg';
            }
        } 
        else 
        {
            $product['imageUrl'] = $baseUrl . $relativeImagePath . 'default.jpg';
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $products
    ], JSON_UNESCAPED_UNICODE);
} 
catch (PDOException $e) 
{
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка загрузки товаров: ' . $e->getMessage()]);
}
?>