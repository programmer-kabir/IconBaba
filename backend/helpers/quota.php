<?php
// backend/helpers/quota.php
// Manages server-side daily export/copy quotas (10 guest, 20 free user, unlimited pro)

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/rate_limit.php';

define('GUEST_DAILY_EXPORT_LIMIT', 10);
define('FREE_USER_DAILY_EXPORT_LIMIT', 20);

/**
 * Returns current daily quota status for a guest or logged-in user
 */
function getDailyQuotaStatus($pdo, $user = null, $ip = null) {
    if ($ip === null) {
        $ip = getClientIpAddress();
    }

    // 1. Pro or Admin User (Unlimited)
    if ($user && is_array($user)) {
        $roles = getUserRoles($user);
        if (in_array('admin', $roles) || in_array('pro', $roles) || in_array('premium', $roles)) {
            return [
                'plan' => 'pro',
                'is_unlimited' => true,
                'used' => 0,
                'limit' => null,
                'remaining' => 999999,
                'can_export' => true,
                'require_login' => false,
                'require_pro' => false
            ];
        }
    }

    // 2. Free Registered User (20 icons / day)
    if ($user && !empty($user['id'])) {
        $userId = (int)$user['id'];
        $identifier = 'u:' . $userId;
        $limit = FREE_USER_DAILY_EXPORT_LIMIT;

        $stmt = $pdo->prepare("
            SELECT count FROM daily_export_usage 
            WHERE usage_date = CURDATE() AND identifier = :identifier 
            LIMIT 1
        ");
        $stmt->execute([':identifier' => $identifier]);
        $used = (int)$stmt->fetchColumn();

        $canExport = $used < $limit;
        return [
            'plan' => 'free',
            'is_unlimited' => false,
            'used' => $used,
            'limit' => $limit,
            'remaining' => max(0, $limit - $used),
            'can_export' => $canExport,
            'require_login' => false,
            'require_pro' => !$canExport
        ];
    }

    // 3. Guest Visitor (10 icons / day by IP)
    $identifier = 'ip:' . $ip;
    $limit = GUEST_DAILY_EXPORT_LIMIT;

    $stmt = $pdo->prepare("
        SELECT count FROM daily_export_usage 
        WHERE usage_date = CURDATE() AND identifier = :identifier 
        LIMIT 1
    ");
    $stmt->execute([':identifier' => $identifier]);
    $used = (int)$stmt->fetchColumn();

    $canExport = $used < $limit;
    return [
        'plan' => 'guest',
        'is_unlimited' => false,
        'used' => $used,
        'limit' => $limit,
        'remaining' => max(0, $limit - $used),
        'can_export' => $canExport,
        'require_login' => !$canExport,
        'require_pro' => false
    ];
}

/**
 * Validates and consumes 1 export/copy quota.
 * Returns quota status if allowed, or false with error info if quota exceeded.
 */
function consumeDailyQuota($pdo, $user = null, $ip = null) {
    if ($ip === null) {
        $ip = getClientIpAddress();
    }

    $status = getDailyQuotaStatus($pdo, $user, $ip);

    if (!$status['can_export']) {
        return $status;
    }

    if ($status['is_unlimited']) {
        return $status;
    }

    $userId = ($user && !empty($user['id'])) ? (int)$user['id'] : null;
    $identifier = $userId ? ('u:' . $userId) : ('ip:' . $ip);

    $stmt = $pdo->prepare("
        INSERT INTO daily_export_usage (usage_date, identifier, user_id, ip_address, count)
        VALUES (CURDATE(), :identifier, :user_id, :ip, 1)
        ON DUPLICATE KEY UPDATE count = count + 1
    ");
    $stmt->execute([
        ':identifier' => $identifier,
        ':user_id' => $userId,
        ':ip' => $ip
    ]);

    // Refresh status after increment
    $status['used'] += 1;
    $status['remaining'] = max(0, $status['limit'] - $status['used']);
    $status['can_export'] = $status['used'] < $status['limit'];
    if (!$status['can_export']) {
        if ($status['plan'] === 'guest') {
            $status['require_login'] = true;
        } else {
            $status['require_pro'] = true;
        }
    }

    return $status;
}
