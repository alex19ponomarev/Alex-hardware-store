<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') 
{
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['order'])) 
{
    echo json_encode(['status' => 'error', 'message' => 'Некорректные данные']);
    exit;
}
$order = $data['order'];


$city = $order['city'] ?? 'Не указан'; 

$items = $order['items'] ?? [];
if (!is_array($items)) 
{
    $items = [];
}
$itemsCount = 0;
$hasQuantityField = false;
foreach ($items as $item) 
{
    if (is_array($item) && isset($item['quantity'])) 
    {
        $hasQuantityField = true;
        break;
    }
}
if ($hasQuantityField) 
{
    foreach ($items as $item) 
    {
        if (is_array($item) && isset($item['quantity'])) 
        {
            $quantity = (int)$item['quantity'];
            $itemsCount += $quantity > 0 ? $quantity : 0;
        }
    }
} 
else 
{
    $itemsCount = count($items);
}
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'alextechstoredatebei';
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) 
{
    echo json_encode(['status' => 'error', 'message' => 'Ошибка соединения с базой']);
    exit;
}


$createTableSql = "CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  order_data TEXT NOT NULL,
  items_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($createTableSql);


$stmt = $conn->prepare("INSERT INTO orders (city, order_data, items_count) VALUES (?, ?, ?)");
$orderJson = json_encode($order);


$stmt->bind_param('ssi', $city, $orderJson, $itemsCount);

if ($stmt->execute()) 
{
    echo json_encode(['status' => 'success', 'message' => 'Заказ успешно сохранен']);
} 
else 
{
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при сохранении заказа']);
}

$stmt->close();
$conn->close();
?>