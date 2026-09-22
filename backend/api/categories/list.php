<?php
// backend/api/categories/list.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

// Fetch categories with live icon count (only active categories & published icons)
$query = "
    SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.display_order,
        COUNT(CASE WHEN i.status = 'published' THEN i.id ELSE NULL END) AS icon_count
    FROM categories c
    LEFT JOIN icons i ON c.id = i.category_id
    WHERE c.status = 'active'
    GROUP BY c.id, c.name, c.slug, c.display_order
    ORDER BY c.display_order ASC, c.name ASC
";

$stmt = $pdo->query($query);
$categories = $stmt->fetchAll();

// Calculate total published icons for 'All'
$totalStmt = $pdo->query("SELECT COUNT(*) FROM icons WHERE status = 'published'");
$totalIcons = (int)$totalStmt->fetchColumn();


// Format response
$formatted = array_map(function($cat) {
    return [
        'id' => (int)$cat['id'],
        'name' => $cat['name'],
        'slug' => $cat['slug'],
        'icon_count' => (int)$cat['icon_count']
    ];
}, $categories);

jsonResponse(true, [
    'total_icons' => $totalIcons,
    'categories' => $formatted
]);
