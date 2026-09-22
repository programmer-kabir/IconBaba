<?php
// backend/api/auth/login.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/validator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getJsonInput();
$login = sanitizeString($input['login'] ?? $input['email'] ?? $input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($login) || empty($password)) {
    jsonResponse(false, null, 'Login identifier (email or username) and password are required', 400);
}

// Find user by email or username
$stmt = $pdo->prepare("SELECT id, username, email, password_hash, full_name, avatar_url, role FROM users WHERE email = :email OR username = :username LIMIT 1");
$stmt->execute([':email' => $login, ':username' => $login]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(false, null, 'Invalid credentials', 401);
}

// Create new session token
$token = generateSessionToken();
$expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$sessionStmt = $pdo->prepare("
    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (:user_id, :token, :ip, :ua, :expires_at)
");
$sessionStmt->execute([
    ':user_id' => $user['id'],
    ':token' => $token,
    ':ip' => $ip,
    ':ua' => $ua,
    ':expires_at' => $expiresAt
]);

jsonResponse(true, [
    'token' => $token,
    'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'] ?: $user['username'],
        'avatar_url' => $user['avatar_url'],
        'role' => $user['role']
    ]
], 'Login successful');
