<?php
// backend/helpers/auth.php
// Custom Token/Session authentication helper

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } else if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        foreach ($requestHeaders as $key => $val) {
            if (strtolower($key) === 'authorization') {
                $headers = trim($val);
                break;
            }
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s+(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }
        return $headers;
    }
    
    // Fallback: check session cookie or GET/POST token parameter
    if (isset($_COOKIE['iconbaba_token'])) {
        return $_COOKIE['iconbaba_token'];
    }
    if (isset($_GET['token'])) {
        return $_GET['token'];
    }
    if (isset($_POST['token'])) {
        return $_POST['token'];
    }

    return null;
}

function getAuthenticatedUser($pdo) {
    $token = getBearerToken();
    if (!$token) {
        return null;
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, u.role, u.created_at, s.expires_at
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = :token AND s.expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function requireAuth($pdo) {
    $user = getAuthenticatedUser($pdo);
    if (!$user) {
        jsonResponse(false, null, 'Unauthorized. Please log in to continue.', 401);
    }
    return $user;
}

function requireAdmin($pdo) {
    $user = requireAuth($pdo);
    if (($user['role'] ?? '') !== 'admin') {
        jsonResponse(false, null, 'Forbidden. Administrator access required.', 403);
    }
    return $user;
}

function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

