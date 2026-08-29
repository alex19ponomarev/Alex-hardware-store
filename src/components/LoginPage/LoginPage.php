<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $server = "localhost";
    $dbname = "alextechstoredatebei";
    $dblogin = "root";
    $dbpass = "";
    $dbstr = "mysql:host=$server;dbname=$dbname";

    try {
        $pdo = new PDO($dbstr, $dblogin, $dbpass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $password == $user['password']) {


            setcookie('user_email', $user['email'], [
                'expires' => time() + 86400,
                'path' => '/',
                'Secure' => false,
                'HttpOnly' => true,
                'SameSite' => 'Lax'
            ]);


            $_SESSION['user'] = [
                'email' => $user['email']
            ];

            echo json_encode(['status' => 'success', 'email' => $user['email']]);
            exit;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Некорректные данные']);
            exit;
        }
    } catch (PDOException $ex) {
        echo json_encode(['status' => 'error', 'message' => $ex->getMessage()]);
        exit;
    }
}
?>