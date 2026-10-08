<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$lat = isset($input['lat']) ? (float)$input['lat'] : null;
$lon = isset($input['lon']) ? (float)$input['lon'] : null;

if ($lat === null || $lon === null) {
    echo json_encode(['success' => false, 'message' => 'Не указаны координаты']);
    exit;
}

$url = sprintf(
    'https://nominatim.openstreetmap.org/reverse?format=json&lat=%F&lon=%F&zoom=18&addressdetails=1&accept-language=ru',
    $lat,
    $lon
);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);

curl_setopt($ch, CURLOPT_USERAGENT, 'AlexTechStore/1.0 (diploma project; contact: Alex@techstore.ru)');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Accept-Language: ru',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo json_encode(['success' => false, 'message' => 'Ошибка запроса к Nominatim'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode(['success' => false, 'message' => 'Nominatim вернул ' . $httpCode], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($response, true);

if (!$data || !isset($data['address'])) {
    echo json_encode(['success' => false, 'message' => 'Адрес не найден'], JSON_UNESCAPED_UNICODE);
    exit;
}

$addr = $data['address'];

$city = $addr['city'] ?? $addr['town'] ?? $addr['village'] ?? $addr['state'] ?? '';
$street = $addr['road'] ?? '';
$house = $addr['house_number'] ?? '';

$parts = [];
if ($city) $parts[] = $city;
if ($street) $parts[] = $street;
if ($house) $parts[] = $house;

$cleanAddress = implode(', ', $parts);

echo json_encode([
    'success' => true,
    'address' => $cleanAddress ?: $data['display_name'],
    'full'    => $data['display_name'] ?? '',
], JSON_UNESCAPED_UNICODE);