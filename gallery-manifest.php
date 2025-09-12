<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$manifestFile = 'gallery_manifest.json';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // Read manifest
    try {
        if (file_exists($manifestFile)) {
            $manifestContent = file_get_contents($manifestFile);
            $manifest = json_decode($manifestContent, true);
            
            if ($manifest === null) {
                // Invalid JSON, return default
                $manifest = ['Male' => 0, 'Female' => 0];
            }
        } else {
            // File doesn't exist, return default
            $manifest = ['Male' => 0, 'Female' => 0];
        }
        
        echo json_encode([
            'success' => true,
            'manifest' => $manifest
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read manifest: ' . $e->getMessage()]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Write manifest
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            exit;
        }
        
        // Validate manifest structure
        if (!isset($input['Male']) || !isset($input['Female'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid manifest structure. Must contain Male and Female counts']);
            exit;
        }
        
        // Ensure values are integers
        $manifest = [
            'Male' => (int)$input['Male'],
            'Female' => (int)$input['Female']
        ];
        
        // Save manifest
        $manifestJson = json_encode($manifest, JSON_PRETTY_PRINT);
        if (file_put_contents($manifestFile, $manifestJson) === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save manifest']);
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'manifest' => $manifest
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save manifest: ' . $e->getMessage()]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>