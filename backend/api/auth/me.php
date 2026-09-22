<?php
// backend/api/auth/me.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';

$user = requireAuth($pdo);

// Get favorites count and collections count for this user
$favStmt = $pdo->prepare("SELECT COUNT(*) FROM favorites WHERE user_id = :uid");
$favStmt->execute([':uid' => $user['id']]);
$favoritesCount = (int)$favStmt->fetchColumn();

$colStmt = $pdo->prepare("SELECT COUNT(*) FROM collections WHERE user_id = :uid");
$colStmt->execute([':uid' => $user['id']]);
$collectionsCount = (int)$colStmt->fetchColumn();

$downStmt = $pdo->prepare("SELECT COUNT(*) FROM downloads WHERE user_id = :uid");
$downStmt->execute([':uid' => $user['id']]);
$downloadsCount = (int)$downStmt->fetchColumn();

jsonResponse(true, [
    'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'] ?: $user['username'],
        'avatar_url' => $user['avatar_url'],
        'role' => $user['role'],
        'created_at' => $user['created_at'],
        'stats' => [
            'favorites_count' => $favoritesCount,
            'collections_count' => $collectionsCount,
            'downloads_count' => $downloadsCount
        ]
    ]
]);
