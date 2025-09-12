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

        // Gallery endpoints
        if (pathname === '/gallery-list.php' && req.method === 'GET') {
            this.handleGalleryList(res);
            return;
        }

        if (pathname === '/gallery-manifest.php') {
            if (req.method === 'GET') {
                this.handleGalleryManifestGet(res);
            } else if (req.method === 'POST') {
                this.handleGalleryManifestPost(req, res);
            } else {
                res.writeHead(405);
                res.end('Method not allowed');
            }
            return;
        }

        // Gallery upload endpoint
        if (pathname === '/gallery-upload.php' && req.method === 'POST') {
            this.handleGalleryUpload(req, res);
            return;
        }

        // Gallery delete endpoint
        if (pathname === '/gallery-delete.php' && req.method === 'POST') {
            this.handleGalleryDelete(req, res);
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

    // Gallery management methods
    handleGalleryList(res) {
        try {
            const galleryDir = path.join('.', 'img', 'gallery');
            const categories = ['Male', 'Female'];
            const images = [];
            
            // Ensure gallery directory exists
            if (!fs.existsSync(galleryDir)) {
                fs.mkdirSync(galleryDir, { recursive: true });
            }
            
            categories.forEach(category => {
                const categoryDir = path.join(galleryDir, category);
                
                if (!fs.existsSync(categoryDir)) {
                    return;
                }
                
                try {
                    // Get all image files
                    const files = fs.readdirSync(categoryDir)
                        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                        .map(file => path.join(categoryDir, file));
                    
                    files.forEach(filePath => {
                        try {
                            const filename = path.basename(filePath);
                            const stats = fs.statSync(filePath);
                            const relativePath = filePath.replace(/\\/g, '/');
                            
                            // Extract sequence number from filename
                            const parsedName = path.parse(filename).name;
                            const sequenceNumber = parseInt(parsedName);
                            
                            // Skip files that don't have numeric names
                            if (isNaN(sequenceNumber)) {
                                return;
                            }
                            
                            images.push({
                                filename: filename,
                                path: relativePath,
                                category: category,
                                size: stats.size,
                                sequence: sequenceNumber,
                                modified: stats.mtime.getTime()
                            });
                        } catch (fileError) {
                            console.log(`Error processing file ${filePath}: ${fileError.message}`);
                        }
                    });
                } catch (dirError) {
                    console.log(`Error reading directory ${categoryDir}: ${dirError.message}`);
                }
            });
            
            // Sort by category first, then by sequence
            images.sort((a, b) => {
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                return a.sequence - b.sequence;
            });
            
            const response = {
                success: true,
                images: images,
                total: images.length
            };
            
            console.log(`Gallery list: Found ${images.length} images`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            
        } catch (error) {
            console.log(`Gallery list error: ${error.message}`);
            const response = {
                success: false,
                error: error.message,
                images: [],
                total: 0
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        }
    }
    
    handleGalleryManifestGet(res) {
        try {
            const manifestFile = 'gallery_manifest.json';
            let manifest = { Male: 0, Female: 0 };
            
            if (fs.existsSync(manifestFile)) {
                const content = fs.readFileSync(manifestFile, 'utf8');
                const data = JSON.parse(content);
                manifest = { ...manifest, ...data };
            }
            
            const response = {
                success: true,
                manifest: manifest
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Error reading manifest: ${error.message}` }));
        }
    }
    
    handleGalleryManifestPost(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // Validate structure
                if (typeof data.Male === 'undefined' || typeof data.Female === 'undefined') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid manifest structure' }));
                    return;
                }
                
                const manifest = {
                    Male: parseInt(data.Male),
                    Female: parseInt(data.Female)
                };
                
                const manifestFile = 'gallery_manifest.json';
                fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
                
                const response = {
                    success: true,
                    manifest: manifest
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Error saving manifest: ${error.message}` }));
            }
        });
    }

    // Gallery upload handler
    handleGalleryUpload(req, res) {
        const multiparty = require('multiparty');
        const form = new multiparty.Form();
        
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: `Form parsing error: ${err.message}` }));
                return;
            }
            
            try {
                const category = fields.category && fields.category[0];
                const uploadedFile = files.image && files.image[0];
                
                if (!category || !['Male', 'Female'].includes(category)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid category. Must be Male or Female.' }));
                    return;
                }
                
                if (!uploadedFile) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'No image file provided.' }));
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(uploadedFile.headers['content-type'])) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' }));
                    return;
                }
                
                // Validate file size (5MB max)
                if (uploadedFile.size > 5 * 1024 * 1024) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'File too large. Maximum size is 5MB.' }));
                    return;
                }
                
                // Create category directory if it doesn't exist
                const galleryDir = path.join('.', 'img', 'gallery');
                const categoryDir = path.join(galleryDir, category);
                
                if (!fs.existsSync(galleryDir)) {
                    fs.mkdirSync(galleryDir, { recursive: true });
                }
                if (!fs.existsSync(categoryDir)) {
                    fs.mkdirSync(categoryDir, { recursive: true });
                }
                
                // Find the next sequence number
                const existingFiles = fs.readdirSync(categoryDir)
                    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                    .map(file => {
                        const name = path.parse(file).name;
                        const seq = parseInt(name);
                        return isNaN(seq) ? 0 : seq;
                    })
                    .sort((a, b) => b - a);
                
                const nextSequence = existingFiles.length > 0 ? existingFiles[0] + 1 : 1;
                
                // Determine file extension
                const contentType = uploadedFile.headers['content-type'];
                let ext = 'jpg';
                if (contentType === 'image/png') ext = 'png';
                else if (contentType === 'image/webp') ext = 'webp';
                
                const filename = `${nextSequence}.${ext}`;
                const targetPath = path.join(categoryDir, filename);
                
                // Copy the file
                fs.copyFileSync(uploadedFile.path, targetPath);
                
                // Clean up temporary file
                fs.unlinkSync(uploadedFile.path);
                
                // Update manifest
                this.updateGalleryManifest();
                
                const response = {
                    success: true,
                    filename: filename,
                    path: targetPath.replace(/\\/g, '/'),
                    category: category,
                    sequence: nextSequence,
                    size: fs.statSync(targetPath).size
                };
                
                console.log(`Gallery upload: ${filename} to ${category} category`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: `Upload error: ${error.message}` }));
            }
        });
    }

    // Gallery delete handler
    handleGalleryDelete(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (data.bulk && data.images && Array.isArray(data.images)) {
                    // Bulk delete
                    let deletedCount = 0;
                    const errors = [];
                    
                    data.images.forEach(img => {
                        try {
                            const filePath = path.join('.', 'img', 'gallery', img.category, img.filename);
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                                deletedCount++;
                                console.log(`Deleted: ${img.category}/${img.filename}`);
                            } else {
                                errors.push(`File not found: ${img.filename}`);
                            }
                        } catch (error) {
                            errors.push(`Error deleting ${img.filename}: ${error.message}`);
                        }
                    });
                    
                    // Update manifest
                    this.updateGalleryManifest();
                    
                    const response = {
                        success: true,
                        deleted: deletedCount,
                        errors: errors,
                        manifest: this.getGalleryManifest()
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                    
                } else if (data.category && data.filename) {
                    // Single delete
                    const filePath = path.join('.', 'img', 'gallery', data.category, data.filename);
                    
                    if (!fs.existsSync(filePath)) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'File not found' }));
                        return;
                    }
                    
                    fs.unlinkSync(filePath);
                    console.log(`Deleted: ${data.category}/${data.filename}`);
                    
                    // Update manifest
                    this.updateGalleryManifest();
                    
                    const response = {
                        success: true,
                        deleted: data.filename,
                        manifest: this.getGalleryManifest()
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                    
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid delete request format' }));
                }
                
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: `Delete error: ${error.message}` }));
            }
        });
    }

    // Helper method to update gallery manifest
    updateGalleryManifest() {
        try {
            const galleryDir = path.join('.', 'img', 'gallery');
            const manifest = { Male: 0, Female: 0 };
            
            ['Male', 'Female'].forEach(category => {
                const categoryDir = path.join(galleryDir, category);
                if (fs.existsSync(categoryDir)) {
                    const files = fs.readdirSync(categoryDir)
                        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
                    manifest[category] = files.length;
                }
            });
            
            const manifestFile = 'gallery_manifest.json';
            fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
            
            return manifest;
        } catch (error) {
            console.log(`Error updating gallery manifest: ${error.message}`);
            return { Male: 0, Female: 0 };
        }
    }

    // Helper method to get gallery manifest
    getGalleryManifest() {
        try {
            const manifestFile = 'gallery_manifest.json';
            if (fs.existsSync(manifestFile)) {
                const content = fs.readFileSync(manifestFile, 'utf8');
                return JSON.parse(content);
            }
            return this.updateGalleryManifest();
        } catch (error) {
            console.log(`Error reading gallery manifest: ${error.message}`);
            return { Male: 0, Female: 0 };
        }
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new CollectionServer();
    server.start();
}

module.exports = CollectionServer;
