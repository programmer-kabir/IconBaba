<?php
// backend/api/admin/users/update_status.php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/audit.php';

$admin = requireAdmin($pdo);

$data = getJsonInput();
$userId = (int)($data['id'] ?? 0);

if ($userId <= 0) {
    jsonResponse(false, null, 'Valid User ID is required.', 400);
}

// Fetch user
$stmt = $pdo->prepare("SELECT id, username, email, role, status FROM users WHERE id = :id");
$stmt->execute([':id' => $userId]);
$targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$targetUser) {
    jsonResponse(false, null, 'User not found.', 404);
}

// Prevent self-demotion or self-suspension
if ($targetUser['id'] === $admin['id']) {
    if (isset($data['status']) && $data['status'] === 'suspended') {
        jsonResponse(false, null, 'You cannot suspend your own admin account.', 400);
    }
    if (isset($data['role']) && $data['role'] !== 'admin') {
        jsonResponse(false, null, 'You cannot remove your own admin privileges.', 400);
    }
}

$newStatus = isset($data['status']) && in_array($data['status'], ['active', 'suspended']) 
    ? $data['status'] 
    : $targetUser['status'];

$newRole = isset($data['role']) && in_array($data['role'], ['user', 'admin']) 
    ? $data['role'] 
    : $targetUser['role'];

try {
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET status = :status, role = :role, updated_at = NOW()
        WHERE id = :id
    ");
    $updateStmt->execute([
        ':status' => $newStatus,
        ':role' => $newRole,
        ':id' => $userId
    ]);

    logAdminAction($pdo, $admin['id'], 'update_user_status', 'user', $userId, [
        'username' => $targetUser['username'],
        'old_status' => $targetUser['status'],
        'new_status' => $newStatus,
        'old_role' => $targetUser['role'],
        'new_role' => $newRole
    ]);

    jsonResponse(true, [
        'id' => $userId,
        'status' => $newStatus,
        'role' => $newRole
    ], 'User updated successfully.');

} catch (Exception $e) {
    jsonResponse(false, null, 'Failed to update user: ' . $e->getMessage(), 500);
}
