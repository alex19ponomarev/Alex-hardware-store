<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$text = isset($_POST['text']) ? trim($_POST['text']) : '';

if ($text === '') {
    echo json_encode(['ok' => true, 'bad_word' => null], JSON_UNESCAPED_UNICODE);
    exit;
}

$host = 'localhost';
$db   = 'alexpocd_alextec';
$user = 'alexpocd_alextec';
$pass = 'YOUR_DB_PASSWORD';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT word FROM banned_words");
    $lower = mb_strtolower($text, 'UTF-8');

    $foundWord = null;
    foreach ($stmt as $row) {
        $w = mb_strtolower($row['word'], 'UTF-8');
        if ($w !== '' && mb_strpos($lower, $w) !== false) {
            $foundWord = $row['word'];
            break;
        }
    }

    echo json_encode([
        'ok'       => $foundWord === null,
        'bad_word' => $foundWord
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'message' => 'Ошибка БД: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>