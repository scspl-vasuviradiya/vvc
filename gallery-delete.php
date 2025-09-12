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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Function to renumber files in a category directory
function renumberCategoryFiles($categoryDir, $category) {
    if (!file_exists($categoryDir)) {
        return 0;
    }
    
    // Get all image files
    $files = glob($categoryDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);
    
    if (empty($files)) {
        return 0;
    }
    
    // Sort files by sequence number (extracted from filename)
    usort($files, function($a, $b) {
        $aNum = (int)pathinfo(basename($a), PATHINFO_FILENAME);
        $bNum = (int)pathinfo(basename($b), PATHINFO_FILENAME);
        return $aNum - $bNum;
    });
    
    // Rename files to sequential numbers starting from 1
    $tempFiles = [];
    
    // First pass: rename to temporary names to avoid conflicts
    foreach ($files as $index => $filePath) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $tempName = $categoryDir . '/temp_' . ($index + 1) . '.' . $extension;
        rename($filePath, $tempName);
        $tempFiles[] = $tempName;
    }
    
    // Second pass: rename to final sequential names
    foreach ($tempFiles as $index => $tempPath) {
        $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
        $finalName = $categoryDir . '/' . ($index + 1) . '.' . $extension;
        rename($tempPath, $finalName);
    }
    
    return count($files);
}

try {
    $deletedFiles = [];
    
    if (isset($input['bulk']) && $input['bulk'] === true) {
        // Bulk delete
        if (!isset($input['images']) || !is_array($input['images'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Images array required for bulk delete']);
            exit;
        }
        
        foreach ($input['images'] as $image) {
            if (!isset($image['category']) || !isset($image['filename'])) {
                continue; // Skip invalid entries
            }
            
            $category = $image['category'];
            $filename = $image['filename'];
            $filePath = $galleryDir . '/' . $category . '/' . $filename;
            
            if (file_exists($filePath)) {
                if (unlink($filePath)) {
                    $deletedFiles[] = $category . '/' . $filename;
                }
            }
        }
    } else {
        // Single delete
        if (!isset($input['category']) || !isset($input['filename'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Category and filename required']);
            exit;
        }
        
        $category = $input['category'];
        $filename = $input['filename'];
        $filePath = $galleryDir . '/' . $category . '/' . $filename;
        
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
            exit;
        }
        
        if (unlink($filePath)) {
            $deletedFiles[] = $category . '/' . $filename;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete image']);
            exit;
        }
    }
    
    if (empty($deletedFiles)) {
        http_response_code(500);
        echo json_encode(['error' => 'No files were deleted']);
        exit;
    }
    
    // After deletion, renumber files in affected categories and update manifest
    $affectedCategories = [];
    foreach ($deletedFiles as $deletedFile) {
        $category = explode('/', $deletedFile)[0];
        $affectedCategories[$category] = true;
    }
    
    $manifest = ['Male' => 0, 'Female' => 0];
    
    foreach (array_keys($affectedCategories) as $category) {
        $categoryDir = $galleryDir . '/' . $category;
        $count = renumberCategoryFiles($categoryDir, $category);
        $manifest[$category] = $count;
    }
    
    // Update counts for unaffected categories
    foreach (['Male', 'Female'] as $category) {
        if (!isset($affectedCategories[$category])) {
            $categoryDir = $galleryDir . '/' . $category;
            if (file_exists($categoryDir)) {
                $files = glob($categoryDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);
                $manifest[$category] = count($files);
            }
        }
    }
    
    // Save updated manifest
    $manifestJson = json_encode($manifest, JSON_PRETTY_PRINT);
    if (file_put_contents($manifestFile, $manifestJson) === false) {
        // Files deleted but manifest update failed
        echo json_encode([
            'success' => true,
            'deleted' => $deletedFiles,
            'warning' => 'Files deleted but manifest update failed',
            'manifest' => $manifest
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'deleted' => $deletedFiles,
            'manifest' => $manifest,
            'renumbered_categories' => array_keys($affectedCategories)
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Delete operation failed: ' . $e->getMessage()]);
}
?>