<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$galleryDir = 'img/gallery';
$categories = ['Male', 'Female'];
$images = [];

try {
    foreach ($categories as $category) {
        $categoryDir = $galleryDir . '/' . $category;
        
        if (!file_exists($categoryDir)) {
            continue;
        }
        
        // Get all image files in the category directory
        $files = glob($categoryDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);
        
        foreach ($files as $filePath) {
            $filename = basename($filePath);
            $fileSize = filesize($filePath);
            $relativePath = str_replace('\\', '/', $filePath); // Normalize path separators for web
            
            // Extract sequence number from filename
            $sequenceNumber = (int)pathinfo($filename, PATHINFO_FILENAME);
            
            $images[] = [
                'filename' => $filename,
                'path' => $relativePath,
                'category' => $category,
                'size' => $fileSize,
                'sequence' => $sequenceNumber,
                'modified' => filemtime($filePath)
            ];
        }
    }
    
    // Sort images by category first, then by sequence number
    usort($images, function($a, $b) {
        if ($a['category'] !== $b['category']) {
            return strcmp($a['category'], $b['category']);
        }
        return $a['sequence'] - $b['sequence'];
    });
    
    echo json_encode([
        'success' => true,
        'images' => $images,
        'total' => count($images)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to list gallery images: ' . $e->getMessage()]);
}
?>