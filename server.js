#!/usr/bin/env node
/**
 * Collection Management Server - Node.js Version
 * Handles collections.json saving and image uploads with full CORS support
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class CollectionServer {
    constructor() {
        this.collectionsFile = 'collections.json';
        this.imagesDir = path.join('img', 'collections');
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        // Ensure images directory exists
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    // MIME type mapping
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp'
        };
        return mimeTypes[ext] || 'text/plain';
    }

    // Add CORS headers
    addCORSHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Handle static file serving
    serveStaticFile(req, res, filePath) {
        const fullPath = path.join('.', filePath);
        
        if (!fs.existsSync(fullPath)) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        const mimeType = this.getMimeType(fullPath);
        const content = fs.readFileSync(fullPath);
        
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
    }

    // Handle GET collections
    handleGetCollections(res) {
        try {
            if (fs.existsSync(this.collectionsFile)) {
                const data = fs.readFileSync(this.collectionsFile, 'utf8');
                // Validate JSON
                JSON.parse(data);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            } else {
                // Return empty array if file doesn't exist
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                // If file is corrupted, return empty array
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]');
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Error loading collections: ${error.message}` }));
            }
        }
    }

    // Handle POST save collections
    handleSaveCollections(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Parse JSON data
                const data = JSON.parse(body);
                
                // Validate data structure
                if (!Array.isArray(data)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Collections must be an array' }));
                    return;
                }

                // Create backup before saving
                if (fs.existsSync(this.collectionsFile)) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupName = `${this.collectionsFile}.backup.${timestamp}`;
                    fs.copyFileSync(this.collectionsFile, backupName);
                }

                // Save new collections.json
                fs.writeFileSync(this.collectionsFile, JSON.stringify(data, null, 2), 'utf8');

                // Send success response
                const response = {
                    success: true,
                    message: 'Collections saved successfully',
                    count: data.length,
                    timestamp: new Date().toLocaleString()
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Error saving collections: ${error.message}` }));
            }
        });
    }

    // Handle image upload
    handleImageUpload(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Parse JSON data
                const data = JSON.parse(body);
                
                if (!data.imageData || !data.filename) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing imageData or filename' }));
                    return;
                }

                const { imageData, filename } = data;

                // Extract base64 data
                const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!match) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid image data format' }));
                    return;
                }

                const imageType = match[1];
                const b64Data = match[2];

                // Validate image type
                if (!['jpeg', 'jpg', 'png', 'webp'].includes(imageType)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid image type' }));
                    return;
                }

                // Decode base64 data
                const binaryData = Buffer.from(b64Data, 'base64');

                // Validate size
                if (binaryData.length > this.maxFileSize) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Image too large. Maximum size is 5MB' }));
                    return;
                }

                // Sanitize filename
                let cleanFilename = filename.replace(/[^a-zA-Z0-9\-_.]/g, '');
                if (!cleanFilename) {
                    cleanFilename = `collection_${Date.now()}.${imageType}`;
                }

                // Ensure proper extension
                const parsed = path.parse(cleanFilename);
                if (!parsed.ext || !['jpg', 'jpeg', 'png', 'webp'].includes(parsed.ext.toLowerCase().slice(1))) {
                    cleanFilename = `${parsed.name}.${imageType === 'jpeg' ? 'jpg' : imageType}`;
                }

                const targetPath = path.join(this.imagesDir, cleanFilename);

                // Save file
                fs.writeFileSync(targetPath, binaryData);

                // Send success response
                const response = {
                    success: true,
                    filename: cleanFilename,
                    path: targetPath.replace(/\\/g, '/'), // Use forward slashes for web
                    size: binaryData.length,
                    type: `image/${imageType}`
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Error uploading image: ${error.message}` }));
            }
        });
    }

    // Main request handler
    handleRequest(req, res) {
        // Add CORS headers to all responses
        this.addCORSHeaders(res);

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        // Handle preflight CORS requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Handle API endpoints
        if (pathname === '/save-collections.php') {
            if (req.method === 'GET') {
                this.handleGetCollections(res);
            } else if (req.method === 'POST') {
                this.handleSaveCollections(req, res);
            } else {
                res.writeHead(405);
                res.end('Method not allowed');
            }
            return;
        }

        if (pathname === '/upload-image.php' && req.method === 'POST') {
            this.handleImageUpload(req, res);
            return;
        }

        // Handle static files
        let filePath = pathname === '/' ? '/collection-management.html' : pathname;
        if (filePath.startsWith('/')) {
            filePath = filePath.slice(1);
        }

        this.serveStaticFile(req, res, filePath);
    }

    // Start the server
    start(port = 8888) {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(port, () => {
            console.log('🚀 Collection Management Server starting...');
            console.log(`📍 Server running at: http://localhost:${port}`);
            console.log(`🌐 Open: http://localhost:${port}/collection-management.html`);
            console.log(`📁 Serving from: ${process.cwd()}`);
            console.log(`💾 Collections file: ${path.join(process.cwd(), this.collectionsFile)}`);
            console.log(`🖼️ Images folder: ${path.join(process.cwd(), this.imagesDir)}`);
            console.log('⚠️  Keep this window open to maintain the server');
            console.log('🛑 Press Ctrl+C to stop the server');
            console.log('='.repeat(60));
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ Error: Port ${port} is already in use`);
                console.log('💡 Try stopping other servers or use a different port');
            } else {
                console.log(`❌ Error starting server: ${err.message}`);
            }
            process.exit(1);
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Server stopped by user');
            process.exit(0);
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new CollectionServer();
    server.start();
}

module.exports = CollectionServer;