<?php
// backend/helpers/svg.php
// SVG Validation, Sanitization, and Normalization Helper

function validateAndSanitizeSvg($rawSvg, &$errorMessage = '') {
    if (empty($rawSvg) || !is_string($rawSvg)) {
        $errorMessage = 'SVG content is empty or invalid.';
        return false;
    }

    $trimmed = trim($rawSvg);

    // Basic check for <svg> tag
    if (stripos($trimmed, '<svg') === false || stripos($trimmed, '</svg>') === false) {
        $errorMessage = 'Content does not contain valid <svg> and </svg> tags.';
        return false;
    }

    // Extract everything from <svg to </svg>
    $startPos = stripos($trimmed, '<svg');
    $endPos = strripos($trimmed, '</svg>');
    if ($startPos === false || $endPos === false || $endPos <= $startPos) {
        $errorMessage = 'Malformed SVG structure.';
        return false;
    }
    $svgContent = substr($trimmed, $startPos, ($endPos + 6) - $startPos);

    // Prevent XXE & dangerous keywords
    $dangerousPatterns = [
        '/<!ENTITY/i',
        '/<!DOCTYPE/i',
        '/<script\b[^>]*>(.*?)<\/script>/is',
        '/<foreignObject\b[^>]*>(.*?)<\/foreignObject>/is',
        '/<iframe\b[^>]*>(.*?)<\/iframe>/is',
        '/<object\b[^>]*>(.*?)<\/object>/is',
        '/<embed\b[^>]*>/is',
        '/on[a-z]+\s*=\s*(["\']).*?\1/i', // event handlers like onload, onclick
        '/on[a-z]+\s*=\s*[^"\'\s>]+/i',
        '/javascript\s*:/i',
        '/vbscript\s*:/i',
        '/data\s*:\s*text\/html/i',
    ];

    foreach ($dangerousPatterns as $pattern) {
        if (preg_match($pattern, $svgContent)) {
            // Remove the dangerous content rather than failing if it's just script/event,
            // but if it's ENTITY/DOCTYPE, fail immediately for security
            if (stripos($pattern, 'ENTITY') !== false || stripos($pattern, 'DOCTYPE') !== false) {
                $errorMessage = 'SVG contains disallowed DOCTYPE or ENTITY definitions.';
                return false;
            }
            $svgContent = preg_replace($pattern, '', $svgContent);
        }
    }

    // XML parser validation using DOMDocument with secure flags
    $dom = new DOMDocument();
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;

    // Suppress libxml errors during load
    $prevLibxml = libxml_use_internal_errors(true);
    $loaded = @$dom->loadXML($svgContent, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
    libxml_clear_errors();
    libxml_use_internal_errors($prevLibxml);

    if (!$loaded) {
        $errorMessage = 'SVG failed XML parser validation.';
        return false;
    }

    // Ensure root element is svg
    if (strtolower($dom->documentElement->tagName) !== 'svg') {
        $errorMessage = 'Root element must be <svg>.';
        return false;
    }

    // Ensure viewBox exists, if width and height exist but not viewBox, synthesize one
    $root = $dom->documentElement;
    if (!$root->hasAttribute('viewBox')) {
        $w = $root->getAttribute('width') ?: '24';
        $h = $root->getAttribute('height') ?: '24';
        $w = preg_replace('/[^0-9.]/', '', $w) ?: '24';
        $h = preg_replace('/[^0-9.]/', '', $h) ?: '24';
        $root->setAttribute('viewBox', "0 0 {$w} {$h}");
    }

    // Ensure xmlns="http://www.w3.org/2000/svg"
    if (!$root->hasAttribute('xmlns')) {
        $root->setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    $cleanSvg = $dom->saveXML($root);

    // Normalize colors:
    // Replace hardcoded dark colors with currentColor for flexible theme & customization
    $colorReplacements = [
        '#1E1E1E' => 'currentColor',
        '#1e1e1e' => 'currentColor',
        '#000000' => 'currentColor',
        '#000'    => 'currentColor',
        '#111827' => 'currentColor',
        '#1F2937' => 'currentColor',
        '#222222' => 'currentColor',
        '#222'    => 'currentColor',
        'black'   => 'currentColor',
    ];

    foreach ($colorReplacements as $oldColor => $newColor) {
        // match fill="oldColor" or stroke="oldColor"
        $cleanSvg = str_ireplace('fill="' . $oldColor . '"', 'fill="' . $newColor . '"', $cleanSvg);
        $cleanSvg = str_ireplace('stroke="' . $oldColor . '"', 'stroke="' . $newColor . '"', $cleanSvg);
        $cleanSvg = str_ireplace("fill='{$oldColor}'", "fill='{$newColor}'", $cleanSvg);
        $cleanSvg = str_ireplace("stroke='{$oldColor}'", "stroke='{$newColor}'", $cleanSvg);
        // match style="...fill: oldColor..."
        $cleanSvg = str_ireplace('fill: ' . $oldColor, 'fill: ' . $newColor, $cleanSvg);
        $cleanSvg = str_ireplace('fill:' . $oldColor, 'fill:' . $newColor, $cleanSvg);
        $cleanSvg = str_ireplace('stroke: ' . $oldColor, 'stroke: ' . $newColor, $cleanSvg);
        $cleanSvg = str_ireplace('stroke:' . $oldColor, 'stroke:' . $newColor, $cleanSvg);
    }

    return trim($cleanSvg);
}

function generateSafeSlug($pdo, $name, $excludeId = null) {
    // Basic slugify
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
    if (empty($slug)) {
        $slug = 'icon-' . time();
    }

    $candidate = $slug;
    $counter = 1;

    while (true) {
        $sql = "SELECT id FROM icons WHERE slug = :slug";
        $params = [':slug' => $candidate];
        if ($excludeId) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if (!$stmt->fetch()) {
            return $candidate;
        }
        $candidate = "{$slug}-{$counter}";
        $counter++;
    }
}
