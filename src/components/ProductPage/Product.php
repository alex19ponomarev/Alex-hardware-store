<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$host = '127.0.0.1';
$dbname = 'catalog';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];


if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Не указан ID товара'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
            exit;
        }


        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $hostName = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . '://' . $hostName . '/';
        $relativeImagePath = 'assets/images/';

        $imageField = $product['image'] ?? '';
        if (!empty($imageField)) {
            $product['imageUrl'] = $baseUrl . $relativeImagePath . rawurlencode($imageField);
        } else {
            $product['imageUrl'] = $baseUrl . $relativeImagePath . 'default.jpg';
        }


        $product['price'] = (float)$product['price'];
        $product['oldPrice'] = !empty($product['oldPrice']) ? (float)$product['oldPrice'] : null;
        $product['rating'] = !empty($product['rating']) ? (float)$product['rating'] : 0.0;
        $product['reviews'] = !empty($product['reviews']) ? (int)$product['reviews'] : 0;
        $product['inStock'] = true;


        $rawSpecs = $product['specifications'] ?? '';
        
        if (!empty($rawSpecs)) {

            $decoded = json_decode($rawSpecs, true);
            
            if (is_array($decoded)) {
                $product['specifications'] = $decoded;
            } else {

                error_log("WARNING: Invalid JSON in specifications for product ID $id. Raw data: " . substr($rawSpecs, 0, 50));
                

                $product['specifications'] = $rawSpecs; 
                

            }
        } else {
            $product['specifications'] = [];
        }

        if (empty($product['description'])) {
            $product['description'] = 'Описание товара отсутствует.';
        }

        echo json_encode([
            'success' => true,
            'data' => $product
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка БД: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}


if ($method === 'POST') {

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Некорректный JSON в теле запроса'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id = $input['id'] ?? null;
    $specsData = $input['specifications'] ?? [];

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Требуется поле "id"'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_array($specsData)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Поле "specifications" должно быть объектом/массивом'], JSON_UNESCAPED_UNICODE);
        exit;
    }


    $jsonString = json_encode($specsData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка кодирования JSON'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('UPDATE products SET specifications = ? WHERE id = ?');
        $result = $stmt->execute([$jsonString, $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Товар с таким ID не найден'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Характеристики успешно сохранены',
            'saved_data' => $specsData
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка сохранения: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Метод не поддерживается'], JSON_UNESCAPED_UNICODE);
?>