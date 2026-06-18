<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'catalog';
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try 
    {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY id');
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $baseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/';
        $absoluteImagePath = 'D:/ponomarev/дипломный проект на recte/Alex-hardware-store/public/assets/images/';
        $relativeImagePath = 'assets/images/';

        foreach ($products as &$product) {
            $product['price'] = (float)$product['price'];
            if (isset($product['oldPrice'])) {
                $product['oldPrice'] = (float)$product['oldPrice'];
            }
            $product['rating'] = (float)$product['rating'];
            $product['reviews'] = (int)$product['reviews'];

            if (!empty($product['image'])) {
                $fullFilePath = $absoluteImagePath . $product['image'];
                if (file_exists($fullFilePath)) 
                {
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
        $jsonResponse = json_encode([
            'success' => true,
            'data' => $products
        ], JSON_UNESCAPED_UNICODE);

        if ($jsonResponse === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Ошибка кодирования JSON: ' . json_last_error_msg()]);
        } else {
            echo $jsonResponse;
        }
    } 
        catch (PDOException $e) 
    {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка загрузки товаров: ' . $e->getMessage()]);
    }
}
?>