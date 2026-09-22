<?php
// backend/api/auth/register.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/validator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getJsonInput();
$username = sanitizeString($input['username'] ?? '');
$email = sanitizeString($input['email'] ?? '');
$password = $input['password'] ?? '';
$fullName = sanitizeString($input['full_name'] ?? '');

if (empty($username) || empty($email) || empty($password)) {
    jsonResponse(false, null, 'Username, email, and password are required', 400);
}

if (!isValidUsername($username)) {
    jsonResponse(false, null, 'Username must be 3-30 characters (letters, numbers, underscore, dash)', 400);
}

if (!isValidEmail($email)) {
    jsonResponse(false, null, 'Invalid email address format', 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, null, 'Password must be at least 6 characters long', 400);
}

// Check if username or email already exists
$stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE username = :u OR email = :e LIMIT 1");
$stmt->execute([':u' => $username, ':e' => $email]);
$existing = $stmt->fetch();

if ($existing) {
    if (strtolower($existing['username']) === strtolower($username)) {
        jsonResponse(false, null, 'Username is already taken', 409);
    }
    if (strtolower($existing['email']) === strtolower($email)) {
        jsonResponse(false, null, 'Email address is already registered', 409);
    }
}

// Securely hash password using bcrypt
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    $insertStmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES (:username, :email, :password_hash, :full_name)
    ");
    $insertStmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':full_name' => $fullName ?: $username
    ]);
    $userId = $pdo->lastInsertId();

    // Create session token
    $token = generateSessionToken();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $sessionStmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
        VALUES (:user_id, :token, :ip, :ua, :expires_at)
    ");
    $sessionStmt->execute([
        ':user_id' => $userId,
        ':token' => $token,
        ':ip' => $ip,
        ':ua' => $ua,
        ':expires_at' => $expiresAt
    ]);

    $pdo->commit();

    jsonResponse(true, [
        'token' => $token,
        'user' => [
            'id' => (int)$userId,
            'username' => $username,
            'email' => $email,
            'full_name' => $fullName ?: $username,
            'role' => 'user'
        ]
    ], 'Registration successful', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(false, null, 'Registration failed. Please try again.', 500);
}
