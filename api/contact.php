<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'message' => 'Invalid request.']);
}

if (!empty($data['website'])) {
    respond(200, ['ok' => true, 'message' => 'Thanks.']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'predictatrade-contact-' . hash('sha256', $ip);
if (is_file($rateFile) && (time() - (int) file_get_contents($rateFile)) < 45) {
    respond(429, ['ok' => false, 'message' => 'Please wait a moment before sending another message.']);
}
file_put_contents($rateFile, (string) time(), LOCK_EX);

$kind = ($data['kind'] ?? '') === 'newsletter' ? 'newsletter' : 'contact';
$email = filter_var(trim((string) ($data['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$name = trim((string) ($data['name'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));
$consent = !empty($data['consent']);

if (!$email || strlen($email) > 254 || !$consent) {
    respond(422, ['ok' => false, 'message' => 'Please provide a valid email address and consent.']);
}
if ($kind === 'contact' && ($name === '' || strlen($name) > 120 || $message === '' || strlen($message) > 5000)) {
    respond(422, ['ok' => false, 'message' => 'Please complete the contact form.']);
}

$host = getenv('PAT_SMTP_HOST') ?: 'mail.predictatrade.com';
$port = (int) (getenv('PAT_SMTP_PORT') ?: 465);
$user = getenv('PAT_SMTP_USER') ?: 'no-reply@predictatrade.com';
$pass = getenv('PAT_SMTP_PASS') ?: '';
$from = getenv('PAT_SMTP_FROM') ?: $user;
$to = getenv('PAT_SMTP_TO') ?: 'admin@predictatrade.com';
if ($pass === '') {
    respond(503, ['ok' => false, 'message' => 'Email service is not configured yet.']);
}

function smtp_read($socket, int $expected): void {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') break;
    }
    if (!preg_match('/^' . $expected . '\\s/m', $response)) {
        throw new RuntimeException('SMTP response error.');
    }
}
function smtp_write($socket, string $command, int $expected): void {
    fwrite($socket, $command . "\r\n");
    smtp_read($socket, $expected);
}

try {
    $transport = $port === 465 ? 'ssl://' . $host : $host;
    $socket = fsockopen($transport, $port, $errno, $error, 15);
    if (!$socket) throw new RuntimeException('SMTP connection failed.');
    stream_set_timeout($socket, 15);
    smtp_read($socket, 220);
    smtp_write($socket, 'EHLO predictatrade.com', 250);
    if ($port === 587) {
        smtp_write($socket, 'STARTTLS', 220);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('TLS negotiation failed.');
        smtp_write($socket, 'EHLO predictatrade.com', 250);
    }
    smtp_write($socket, 'AUTH LOGIN', 334);
    smtp_write($socket, base64_encode($user), 334);
    smtp_write($socket, base64_encode($pass), 235);
    smtp_write($socket, 'MAIL FROM:<' . $from . '>', 250);
    smtp_write($socket, 'RCPT TO:<' . $to . '>', 250);
    smtp_write($socket, 'DATA', 354);

    $subject = $kind === 'newsletter' ? 'Predict-A-Trade newsletter subscription request' : 'Predict-A-Trade contact request';
    $body = $kind === 'newsletter'
        ? "Newsletter subscription request\n\nEmail: {$email}\nConsent: confirmed\n"
        : "Contact request\n\nName: {$name}\nEmail: {$email}\nConsent: confirmed\n\nMessage:\n{$message}\n";
    $headers = 'From: Predict-A-Trade website <' . $from . ">\r\n" .
        'Reply-To: ' . $email . "\r\n" .
        'To: ' . $to . "\r\n" .
        'Subject: ' . $subject . "\r\n" .
        "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
    $payload = str_replace(["\r", "\n"], ["\r\n", "\r\n"], $headers . $body);
    $payload = preg_replace('/^\./m', '..', $payload) . "\r\n.";
    fwrite($socket, $payload . "\r\n");
    smtp_read($socket, 250);
    smtp_write($socket, 'QUIT', 221);
    fclose($socket);
    respond(200, ['ok' => true, 'message' => $kind === 'newsletter' ? 'Subscription request sent.' : 'Message sent.']);
} catch (Throwable $error) {
    if (isset($socket) && is_resource($socket)) fclose($socket);
    error_log('Predict-A-Trade contact mail failure: ' . $error->getMessage());
    respond(502, ['ok' => false, 'message' => 'We could not send your request. Please email predictatrade@gmail.com.']);
}
