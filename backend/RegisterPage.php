<?php
header('Content-Type: application/json; charset=utf-8');
mb_internal_encoding('UTF-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Only POST']);
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$name = isset($_POST['name']) ? trim($_POST['name']) : '';

if ($name === '' || $email === '' || $password === '') {
    echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
    exit;
}

if (mb_strlen($name, 'UTF-8') < 2) {
    echo json_encode(['status' => 'error', 'message' => 'Имя слишком короткое']);
    exit;
}

if (mb_strlen($name, 'UTF-8') > 50) {
    echo json_encode(['status' => 'error', 'message' => 'Имя слишком длинное (макс. 50)']);
    exit;
}

if (!preg_match('/^[\p{L}\s-]+$/u', $name)) {
    echo json_encode(['status' => 'error', 'message' => 'Имя: только буквы, пробел и дефис']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'Пароль не менее 8 символов']);
    exit;
}

$server  = 'localhost';
$dbname  = 'alexpocd_alextec';
$dblogin = 'alexpocd_alextec';
$dbpass  = 'YOUR_DB_PASSWORD';

try {
    $pdo = new PDO("mysql:host=$server;dbname=$dbname;charset=utf8mb4", $dblogin, $dbpass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Такой email уже зарегистрирован']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    $stmt->execute([$email, $password, $name]);

    echo json_encode(['status' => 'success', 'message' => 'Регистрация успешна']);
} catch (PDOException $e) {
    $sqlState = $e->getCode();
    $errCode = isset($e->errorInfo[1]) ? $e->errorInfo[1] : 0;

    if ($sqlState === '45000' || $errCode === 1644) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Пожалуйста, используйте нормальное имя'
        ]);
        exit;
    }

    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка БД: ' . $e->getMessage()
    ]);
}
?>