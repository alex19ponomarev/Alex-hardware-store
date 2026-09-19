<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/admin_error.log');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$host     = 'localhost';
$user     = 'alexpocd_alextec';
$password = 'YOUR_DB_PASSWORD';
$dbname   = 'alexpocd_alextec';

$conn = @new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(array('success' => false, 'message' => 'Ошибка соединения с БД: ' . $conn->connect_error));
    exit;
}
$conn->set_charset('utf8mb4');

$action = isset($_GET['action']) ? $_GET['action'] : '';
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) $input = array();

function respond($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function requireAdmin($conn, $email) {
    if (!$email) respond(array('success' => false, 'message' => 'Не авторизован'));
    $stmt = $conn->prepare("SELECT role FROM users WHERE email = ? LIMIT 1");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($role);
    $found = $stmt->fetch();
    $stmt->close();
    if (!$found || $role !== 'admin') {
        respond(array('success' => false, 'message' => 'Доступ запрещён'));
    }
}

$email = '';
if (isset($_COOKIE['user_email']))                $email = $_COOKIE['user_email'];
elseif (isset($input['email']))                   $email = $input['email'];
elseif (isset($_GET['email']))                    $email = $_GET['email'];

if ($action === 'check') {
    if (!$email) respond(array('success' => true, 'isAdmin' => false));
    $stmt = $conn->prepare("SELECT role FROM users WHERE email = ? LIMIT 1");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($role);
    $stmt->fetch();
    $stmt->close();
    respond(array('success' => true, 'isAdmin' => ($role === 'admin')));
}

requireAdmin($conn, $email);

if ($action === 'stats') {
    $stats = array();

    $r = $conn->query("SELECT COUNT(*) AS c FROM products");
    $stats['products'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    $r = $conn->query("SELECT COUNT(*) AS c FROM orders");
    $stats['orders'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    $r = $conn->query("SELECT COUNT(*) AS c FROM users");
    $stats['users'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    $r = $conn->query("SELECT COUNT(*) AS c FROM banned_words");
    $stats['banned'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    $r = $conn->query("SELECT COUNT(*) AS c FROM cities");
    $stats['cities'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    $revenue = 0;
    $r = $conn->query("SELECT order_data FROM orders");
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $j = json_decode($row['order_data'], true);
            if (is_array($j) && isset($j['total'])) $revenue += (float)$j['total'];
        }
    }
    $stats['revenue'] = $revenue;

    respond(array('success' => true, 'data' => $stats));
}

if ($action === 'products.list') {
    $r = $conn->query("SELECT * FROM products ORDER BY id DESC");
    $rows = array();
    if ($r) while ($row = $r->fetch_assoc()) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'products.save') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;

    $name           = isset($input['name']) ? $input['name'] : '';
    $price          = (isset($input['price'])    && $input['price']    !== '') ? (float)$input['price']    : 0;
    $oldPrice       = (isset($input['oldPrice']) && $input['oldPrice'] !== '' && $input['oldPrice'] !== null) ? (float)$input['oldPrice'] : null;
    $discount       = (isset($input['discount']) && $input['discount'] !== '' && $input['discount'] !== null) ? (int)$input['discount']   : null;
    $category       = isset($input['category']) ? $input['category'] : '';
    $rating         = (isset($input['rating'])   && $input['rating']   !== '') ? (float)$input['rating']   : 0;
    $reviews        = (isset($input['reviews'])  && $input['reviews']  !== '') ? (int)$input['reviews']    : 0;
    $image          = isset($input['image']) ? $input['image'] : '';
    $description    = isset($input['description']) ? $input['description'] : '';
    $specifications = isset($input['specifications']) ? $input['specifications'] : '';

    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE products SET
            name=?, price=?, oldPrice=?, discount=?, category=?, rating=?, reviews=?, image=?, description=?, specifications=?
            WHERE id=?");
        if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));

        $stmt->bind_param('sddississsi',
            $name, $price, $oldPrice, $discount,
            $category, $rating, $reviews, $image,
            $description, $specifications, $id
        );
    } else {
        $stmt = $conn->prepare("INSERT INTO products
            (name, price, oldPrice, discount, category, rating, reviews, image, description, specifications)
            VALUES (?,?,?,?,?,?,?,?,?,?)");
        if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));

        $stmt->bind_param('sddississs',
            $name, $price, $oldPrice, $discount,
            $category, $rating, $reviews, $image,
            $description, $specifications
        );
    }

    if ($stmt->execute()) {
        respond(array('success' => true, 'message' => 'Товар сохранён'));
    } else {
        respond(array('success' => false, 'message' => 'Ошибка: ' . $stmt->error));
    }
}

if ($action === 'products.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Товар удалён'));
}

if ($action === 'orders.list') {
    $r = $conn->query("SELECT id, city, address, items_count, created_at, order_data FROM orders ORDER BY id DESC");
    $rows = array();
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $orderData = json_decode($row['order_data'], true);
            if (!is_array($orderData)) $orderData = array();
            $row['total'] = isset($orderData['total']) ? $orderData['total'] : 0;
            $row['items'] = isset($orderData['items']) ? $orderData['items'] : array();
            unset($row['order_data']);
            $rows[] = $row;
        }
    }
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'orders.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM orders WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Заказ удалён'));
}

if ($action === 'users.list') {
    $r = $conn->query("SELECT id, email, name, role FROM users ORDER BY id DESC");
    $rows = array();
    if ($r) while ($row = $r->fetch_assoc()) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'users.setRole') {
    $id   = isset($input['id']) ? (int)$input['id'] : 0;
    $role = (isset($input['role']) && $input['role'] === 'admin') ? 'admin' : 'user';
    $stmt = $conn->prepare("UPDATE users SET role=? WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('si', $role, $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Роль обновлена'));
}

if ($action === 'users.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Пользователь удалён'));
}

if ($action === 'banned.list') {
    $r = $conn->query("SELECT id, word FROM banned_words ORDER BY word");
    $rows = array();
    if ($r) while ($row = $r->fetch_assoc()) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'banned.add') {
    $word = isset($input['word']) ? trim(mb_strtolower($input['word'], 'UTF-8')) : '';
    if ($word === '') respond(array('success' => false, 'message' => 'Пустое слово'));
    $stmt = $conn->prepare("INSERT IGNORE INTO banned_words (word) VALUES (?)");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('s', $word);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Слово добавлено'));
}

if ($action === 'banned.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM banned_words WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Слово удалено'));
}

if ($action === 'cities.list') {
    $r = $conn->query("SELECT id, city_name FROM cities ORDER BY id");
    $rows = array();
    if ($r) while ($row = $r->fetch_assoc()) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'cities.add') {
    $name = isset($input['city_name']) ? trim($input['city_name']) : '';
    if ($name === '') respond(array('success' => false, 'message' => 'Пустое название'));
    $stmt = $conn->prepare("INSERT INTO cities (city_name) VALUES (?)");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('s', $name);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Город добавлен'));
}

if ($action === 'cities.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM cities WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Город удалён'));
}

if ($action === 'sales.list') {
    $r = $conn->query("SELECT * FROM sales_products ORDER BY id DESC");
    $rows = array();
    if ($r) while ($row = $r->fetch_assoc()) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}

if ($action === 'sales.save') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;

    $name     = isset($input['name']) ? $input['name'] : '';
    $price    = (isset($input['price'])    && $input['price']    !== '') ? (float)$input['price']    : 0;
    $oldPrice = (isset($input['oldPrice']) && $input['oldPrice'] !== '' && $input['oldPrice'] !== null) ? (float)$input['oldPrice'] : null;
    $discount = (isset($input['discount']) && $input['discount'] !== '' && $input['discount'] !== null) ? (int)$input['discount']   : null;
    $category = isset($input['category']) ? $input['category'] : '';
    $rating   = (isset($input['rating'])   && $input['rating']   !== '') ? (float)$input['rating']   : 0;
    $reviews  = (isset($input['reviews'])  && $input['reviews']  !== '') ? (int)$input['reviews']    : 0;
    $image    = isset($input['image']) ? $input['image'] : '';
    $saleEnds = (isset($input['saleEnds']) && $input['saleEnds'] !== '') ? $input['saleEnds'] : null;

    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE sales_products SET
            name=?, price=?, oldPrice=?, discount=?, category=?, rating=?, reviews=?, image=?, saleEnds=?
            WHERE id=?");
        if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
        $stmt->bind_param('sddississi',
            $name, $price, $oldPrice, $discount,
            $category, $rating, $reviews, $image, $saleEnds, $id
        );
    } else {
        $stmt = $conn->prepare("INSERT INTO sales_products
            (name, price, oldPrice, discount, category, rating, reviews, image, saleEnds)
            VALUES (?,?,?,?,?,?,?,?,?)");
        if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
        $stmt->bind_param('sddississ',
            $name, $price, $oldPrice, $discount,
            $category, $rating, $reviews, $image, $saleEnds
        );
    }
    if ($stmt->execute()) {
        respond(array('success' => true, 'message' => 'Акция сохранена'));
    } else {
        respond(array('success' => false, 'message' => 'Ошибка: ' . $stmt->error));
    }
}

if ($action === 'sales.delete') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $stmt = $conn->prepare("DELETE FROM sales_products WHERE id=?");
    if (!$stmt) respond(array('success' => false, 'message' => 'SQL error: ' . $conn->error));
    $stmt->bind_param('i', $id);
    $stmt->execute();
    respond(array('success' => true, 'message' => 'Акция удалена'));
}

if ($action === 'upload_image') {
    if (empty($_FILES['image'])) respond(array('success' => false, 'message' => 'Файл не получен'));
    $f = $_FILES['image'];
    if ($f['error'] !== UPLOAD_ERR_OK) respond(array('success' => false, 'message' => 'Ошибка загрузки'));

    $allowed = array('image/jpeg', 'image/png', 'image/webp', 'image/gif');
    if (!in_array($f['type'], $allowed)) respond(array('success' => false, 'message' => 'Неверный тип файла'));

    $ext = pathinfo($f['name'], PATHINFO_EXTENSION);

    if (function_exists('random_bytes')) {
        $filename = bin2hex(random_bytes(20)) . '.' . $ext;
    } else {
        $filename = bin2hex(openssl_random_pseudo_bytes(20)) . '.' . $ext;
    }

    $dir = __DIR__ . '/assets/images/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    if (move_uploaded_file($f['tmp_name'], $dir . $filename)) {
        respond(array('success' => true, 'filename' => $filename));
    }
    respond(array('success' => false, 'message' => 'Не удалось сохранить файл'));
}

respond(array('success' => false, 'message' => 'Неизвестное действие: ' . $action));
?>