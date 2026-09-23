<?php
// backend/api/icons/track_export.php
// Validates daily quota (10 guest, 20 free user, unlimited pro) and logs export actions

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/quota.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$user = getAuthenticatedUser($pdo);

// Require login for any download or copy
if (!$user) {
    jsonResponse(false, [
        'require_login' => true,
    ], 'Please sign in to download or copy vector icons.', 401);
}

$input = getJsonInput();

$iconId = isset($input['icon_id']) ? (int)$input['icon_id'] : 0;
$action = isset($input['action']) ? strtolower(trim($input['action'])) : 'download';
$format = isset($input['format']) ? strtolower(trim($input['format'])) : 'svg';
$size = isset($input['size']) ? (int)$input['size'] : 24;

// 1. Check if this is a PRO icon
$isPremiumIcon = false;
if ($iconId > 0) {
    $stmt = $pdo->prepare("SELECT is_premium FROM icons WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $iconId]);
    $isPremiumIcon = (bool)$stmt->fetchColumn();
}

if ($isPremiumIcon) {
    // Only Pro members, Premium members, or Admins can export/copy Pro icons
    $userRoles = getUserRoles($user);
    $isProUser = in_array('pro', $userRoles) || in_array('admin', $userRoles) || in_array('premium', $userRoles);

    if (!$isProUser) {
        jsonResponse(false, [
            'require_pro' => true,
            'is_premium' => true,
        ], 'This is an exclusive PRO icon. Upgrade to Pro to download and copy all Pro icons!', 403);
    }
}

// 2. Check & Consume Daily Quota (20 free icons per day for registered free users)
$quota = consumeDailyQuota($pdo, $user);

if (!$quota['can_export']) {
    jsonResponse(false, [
        'quota' => $quota,
        'require_pro' => true
    ], 'You have reached your daily free limit of 20 icons. Upgrade to Pro for unlimited downloads and copies!', 403);
}

// 2. If valid icon ID and download action, record in database
if ($iconId > 0) {
    if ($action === 'download') {
        // Increment icon downloads count
        $update = $pdo->prepare("UPDATE icons SET downloads_count = downloads_count + 1 WHERE id = :id");
        $update->execute([':id' => $iconId]);

        // If authenticated user, log to downloads history table
        if ($user) {
            $logFmt = in_array($format, ['svg', 'png']) ? $format : 'svg';
            $stmt = $pdo->prepare("
                INSERT INTO downloads (user_id, icon_id, format, size)
                VALUES (:uid, :iid, :fmt, :sz)
            ");
            $stmt->execute([
                ':uid' => $user['id'],
                ':iid' => $iconId,
                ':fmt' => $logFmt,
                ':sz' => $size
            ]);
        }
    }
}

jsonResponse(true, [
    'allowed' => true,
    'quota' => $quota
], 'Export authorized');
