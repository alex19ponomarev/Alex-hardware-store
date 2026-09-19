<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['order'])) {
    echo json_encode(['status' => 'error', 'message' => 'Некорректные данные'], JSON_UNESCAPED_UNICODE);
    exit;
}

$order    = $data['order'];
$city     = isset($order['city'])    ? trim($order['city'])    : 'Не указан';
$address  = isset($order['address']) ? trim($order['address']) : '';
$items    = isset($order['items']) && is_array($order['items']) ? $order['items'] : [];

if ($address === '') {
    echo json_encode(['status' => 'error', 'message' => 'Адрес доставки не указан'], JSON_UNESCAPED_UNICODE);
    exit;
}

$itemsCount = 0;
$hasQuantityField = false;
foreach ($items as $item) {
    if (is_array($item) && isset($item['quantity'])) {
        $hasQuantityField = true;
        break;
    }
}
if ($hasQuantityField) {
    foreach ($items as $item) {
        if (is_array($item) && isset($item['quantity'])) {
            $q = (int)$item['quantity'];
            $itemsCount += $q > 0 ? $q : 0;
        }
    }
} else {
    $itemsCount = count($items);
}

$host     = 'localhost';
$user     = 'alexpocd_alextec';
$password = 'YOUR_DB_PASSWORD';
$dbname   = 'alexpocd_alextec';

$conn = @new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка соединения с базой'], JSON_UNESCAPED_UNICODE);
    exit;
}
$conn->set_charset('utf8mb4');

$badWord   = null;
$addrLower = mb_strtolower($address, 'UTF-8');
$cityLower = mb_strtolower($city,    'UTF-8');

if ($stmtC = $conn->prepare("SELECT word FROM banned_words")) {
    $stmtC->execute();
    $stmtC->bind_result($bannedWord);
    while ($stmtC->fetch()) {
        $w = mb_strtolower($bannedWord, 'UTF-8');
        if ($w !== '' && (mb_strpos($addrLower, $w) !== false || mb_strpos($cityLower, $w) !== false)) {
            $badWord = $bannedWord;
            break;
        }
    }
    $stmtC->close();
}

if ($badWord !== null) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Адрес содержит недопустимые слова. Измените адрес доставки.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$orderJson = json_encode($order, JSON_UNESCAPED_UNICODE);
$stmt = $conn->prepare("INSERT INTO orders (city, address, order_data, items_count) VALUES (?, ?, ?, ?)");
$stmt->bind_param('sssi', $city, $address, $orderJson, $itemsCount);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Заказ успешно сохранён'], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при сохранении: ' . $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>