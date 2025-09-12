<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$galleryDir = 'img/gallery';
$manifestFile = 'gallery_manifest.json';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Ensure gallery directories exist
if (!file_exists($galleryDir)) {
    mkdir($galleryDir, 0755, true);
}

// Check if category is provided
if (!isset($_POST['category']) || empty($_POST['category'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Category is required']);
    exit;
}

$category = $_POST['category'];
$categoryDir = $galleryDir . '/' . $category;

// Validate category (only Male or Female allowed)
if (!in_array($category, ['Male', 'Female'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid category. Only Male or Female allowed']);
    exit;
}

// Create category directory if it doesn't exist
if (!file_exists($categoryDir)) {
    mkdir($categoryDir, 0755, true);
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];

// Validate file size
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Maximum size is 5MB']);
    exit;
}

// Validate file type
$fileType = strtolower($file['type']);
if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, and WebP allowed']);
    exit;
}

// Load current manifest
$manifest = ['Male' => 0, 'Female' => 0];
if (file_exists($manifestFile)) {
    $manifestContent = file_get_contents($manifestFile);
    $manifestData = json_decode($manifestContent, true);
    if ($manifestData) {
        $manifest = array_merge($manifest, $manifestData);
    }
}

// Find the next sequence number for this category
$nextNumber = $manifest[$category] + 1;

// Determine file extension
$extension = 'jpg'; // Default
$originalType = strtolower($file['type']);
switch ($originalType) {
    case 'image/png':
        $extension = 'png';
        break;
    case 'image/webp':
        $extension = 'webp';
        break;
    case 'image/jpeg':
    case 'image/jpg':
    default:
        $extension = 'jpg';
        break;
}

// Generate filename with sequence number
$filename = $nextNumber . '.' . $extension;
$targetPath = $categoryDir . '/' . $filename;

// Check if file already exists (shouldn't happen with sequential numbering)
if (file_exists($targetPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'File with sequence number already exists']);
    exit;
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Update manifest
    $manifest[$category] = $nextNumber;
    
    // Save updated manifest
    $manifestJson = json_encode($manifest, JSON_PRETTY_PRINT);
    if (file_put_contents($manifestFile, $manifestJson) === false) {
        // File uploaded but manifest update failed
        // Delete the uploaded file to maintain consistency
        unlink($targetPath);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update manifest']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'path' => $targetPath,
        'category' => $category,
        'sequence' => $nextNumber,
        'size' => filesize($targetPath),
        'manifest' => $manifest
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file']);
}
?>