<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30, stale-while-revalidate=60');

function quote_response(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') quote_response(405, ['ok' => false, 'message' => 'Method not allowed.']);

$apiKey = getenv('PAT_FMP_API_KEY') ?: '';
if ($apiKey === '') {
    error_log('Predict-A-Trade FMP API key is not configured.');
    quote_response(503, ['ok' => false, 'message' => 'Live market reference is temporarily unavailable.']);
}

$cacheFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'predictatrade-xauusd-quote.json';
if (is_file($cacheFile) && (time() - (int) filemtime($cacheFile)) < 30) {
    $cached = json_decode((string) file_get_contents($cacheFile), true);
    if (is_array($cached) && !empty($cached['ok'])) quote_response(200, $cached);
}

$url = 'https://financialmodelingprep.com/stable/quote?symbol=XAUUSD&apikey=' . rawurlencode($apiKey);
$payload = false;
$httpStatus = 0;
if (function_exists('curl_init')) {
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 12, CURLOPT_HTTPHEADER => ['Accept: application/json']]);
    $payload = curl_exec($curl);
    $httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
} else {
    $context = stream_context_create(['http' => ['timeout' => 12, 'header' => "Accept: application/json\r\n"]]);
    $payload = @file_get_contents($url, false, $context);
    $httpStatus = 200;
}

$decoded = is_string($payload) ? json_decode($payload, true) : null;
$row = is_array($decoded) && isset($decoded[0]) && is_array($decoded[0]) ? $decoded[0] : null;
$price = is_array($row) ? (float) ($row['price'] ?? 0) : 0;
if ($httpStatus < 200 || $httpStatus >= 300 || !$row || $price <= 0) {
    error_log('Predict-A-Trade FMP quote request failed with status ' . $httpStatus . '.');
    quote_response(502, ['ok' => false, 'message' => 'Live market reference is temporarily unavailable.']);
}

$response = [
    'ok' => true,
    'symbol' => 'XAUUSD',
    'price' => $price,
    'dayHigh' => (float) ($row['dayHigh'] ?? 0),
    'dayLow' => (float) ($row['dayLow'] ?? 0),
    'change' => (float) ($row['change'] ?? 0),
    'changePercent' => (float) ($row['changesPercentage'] ?? 0),
    'timestamp' => (int) ($row['timestamp'] ?? time()),
];
@file_put_contents($cacheFile, json_encode($response, JSON_UNESCAPED_SLASHES), LOCK_EX);
quote_response(200, $response);
