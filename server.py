#!/usr/bin/env python3
"""
Collection Management Server
Python replacement for PHP handlers with full CORS support
"""

import http.server
import socketserver
import json
import os
import base64
import re
import urllib.parse
from datetime import datetime
import mimetypes

class CollectionHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set up paths
        self.collections_file = 'collections.json'
        self.images_dir = 'img/collections'
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        
        # Ensure images directory exists
        os.makedirs(self.images_dir, exist_ok=True)
        
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/save-collections.php':
            self.handle_get_collections()
        elif self.path == '/gallery-list.php':
            self.handle_gallery_list()
        elif self.path == '/gallery-manifest.php':
            self.handle_gallery_manifest_get()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/save-collections.php':
            self.handle_save_collections()
        elif self.path == '/upload-image.php':
            self.handle_upload_image()
        elif self.path == '/gallery-upload.php':
            self.handle_gallery_upload()
        elif self.path == '/gallery-delete.php':
            self.handle_gallery_delete()
        elif self.path == '/gallery-manifest.php':
            self.handle_gallery_manifest_post()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_get_collections(self):
        """Load collections.json"""
        try:
            if os.path.exists(self.collections_file):
                with open(self.collections_file, 'r', encoding='utf-8') as f:
                    data = f.read()
                    # Validate JSON
                    json.loads(data)  # This will raise an exception if invalid
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data.encode('utf-8'))
            else:
                # Return empty array if file doesn't exist
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'[]')
                
        except json.JSONDecodeError:
            # If file is corrupted, return empty array
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'[]')
        except Exception as e:
            self.send_error(500, f"Error loading collections: {str(e)}")
    
    def handle_save_collections(self):
        """Save collections.json"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON data")
                return
            
            # Validate data structure
            if not isinstance(data, list):
                self.send_error(400, "Collections must be an array")
                return
            
            # Create backup before saving
            if os.path.exists(self.collections_file):
                backup_name = f"{self.collections_file}.backup.{datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}"
                with open(self.collections_file, 'r', encoding='utf-8') as src:
                    with open(backup_name, 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
            
            # Save new collections.json
            with open(self.collections_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Send success response
            response = {
                'success': True,
                'message': 'Collections saved successfully',
                'count': len(data),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error saving collections: {str(e)}")
    
    def handle_upload_image(self):
        """Handle image upload"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data (expecting base64 image data)
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON data")
                return
            
            if 'imageData' not in data or 'filename' not in data:
                self.send_error(400, "Missing imageData or filename")
                return
            
            image_data = data['imageData']
            filename = data['filename']
            
            # Extract base64 data
            match = re.match(r'^data:image/(\w+);base64,(.+)$', image_data)
            if not match:
                self.send_error(400, "Invalid image data format")
                return
            
            image_type = match.group(1)
            b64_data = match.group(2)
            
            # Validate image type
            if image_type not in ['jpeg', 'jpg', 'png', 'webp']:
                self.send_error(400, "Invalid image type")
                return
            
            # Decode base64 data
            try:
                binary_data = base64.b64decode(b64_data)
            except Exception:
                self.send_error(400, "Invalid base64 data")
                return
            
            # Validate size
            if len(binary_data) > self.max_file_size:
                self.send_error(400, "Image too large. Maximum size is 5MB")
                return
            
            # Sanitize filename
            filename = re.sub(r'[^a-zA-Z0-9\-_.]', '', filename)
            if not filename:
                filename = f'collection_{int(datetime.now().timestamp())}.{image_type}'
            
            # Ensure proper extension
            name, ext = os.path.splitext(filename)
            if not ext or ext.lower()[1:] not in ['jpg', 'jpeg', 'png', 'webp']:
                filename = f"{name}.{'jpg' if image_type == 'jpeg' else image_type}"
            
            target_path = os.path.join(self.images_dir, filename)
            
            # Save file
            with open(target_path, 'wb') as f:
                f.write(binary_data)
            
            # Send success response
            response = {
                'success': True,
                'filename': filename,
                'path': target_path.replace('\\', '/'),  # Use forward slashes for web
                'size': len(binary_data),
                'type': f'image/{image_type}'
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error uploading image: {str(e)}")

def run_server(port=8888):
    """Start the collection management server"""
    try:
        with socketserver.TCPServer(("", port), CollectionHandler) as httpd:
            print(f"🚀 Collection Management Server starting...")
            print(f"📍 Server running at: http://localhost:{port}")
            print(f"🌐 Open: http://localhost:{port}/collection-management.html")
            print(f"📁 Serving from: {os.getcwd()}")
            print(f"💾 Collections file: {os.path.join(os.getcwd(), 'collections.json')}")
            print(f"🖼️ Images folder: {os.path.join(os.getcwd(), 'img/collections/')}")
            print(f"⚠️  Keep this window open to maintain the server")
            print(f"🛑 Press Ctrl+C to stop the server")
            print("=" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"❌ Error: Port {port} is already in use")
            print(f"💡 Try stopping other servers or use a different port")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

    def handle_gallery_list(self):
        """List all gallery images"""
        try:
            import glob
            gallery_dir = 'img/gallery'
            categories = ['Male', 'Female']
            images = []
            
            # Ensure gallery directory exists
            if not os.path.exists(gallery_dir):
                os.makedirs(gallery_dir, exist_ok=True)
            
            for category in categories:
                category_dir = os.path.join(gallery_dir, category)
                if not os.path.exists(category_dir):
                    continue
                    
                # Get all image files
                pattern = os.path.join(category_dir, '*')
                files = [f for f in glob.glob(pattern) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
                
                for file_path in files:
                    try:
                        filename = os.path.basename(file_path)
                        file_size = os.path.getsize(file_path)
                        relative_path = file_path.replace('\\', '/')
                        
                        # Extract sequence number from filename
                        try:
                            sequence_number = int(os.path.splitext(filename)[0])
                        except ValueError:
                            # Skip files that don't have numeric names
                            continue
                        
                        images.append({
                            'filename': filename,
                            'path': relative_path,
                            'category': category,
                            'size': file_size,
                            'sequence': sequence_number,
                            'modified': os.path.getmtime(file_path)
                        })
                    except Exception as file_error:
                        print(f"Error processing file {file_path}: {file_error}")
                        continue
            
            # Sort by category first, then by sequence
            images.sort(key=lambda x: (x['category'], x['sequence']))
            
            response = {
                'success': True,
                'images': images,
                'total': len(images)
            }
            
            print(f"Gallery list: Found {len(images)} images")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Gallery list error: {str(e)}")
            response = {
                'success': False,
                'error': str(e),
                'images': [],
                'total': 0
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def handle_gallery_manifest_get(self):
        """Get gallery manifest"""
        manifest_file = 'gallery_manifest.json'
        try:
            if os.path.exists(manifest_file):
                with open(manifest_file, 'r', encoding='utf-8') as f:
                    manifest = json.load(f)
            else:
                manifest = {'Male': 0, 'Female': 0}
                
            response = {
                'success': True,
                'manifest': manifest
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error reading manifest: {str(e)}")
    
    def handle_gallery_manifest_post(self):
        """Update gallery manifest"""
        manifest_file = 'gallery_manifest.json'
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validate structure
            if 'Male' not in data or 'Female' not in data:
                self.send_error(400, "Invalid manifest structure")
                return
            
            manifest = {
                'Male': int(data['Male']),
                'Female': int(data['Female'])
            }
            
            with open(manifest_file, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2)
            
            response = {
                'success': True,
                'manifest': manifest
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error saving manifest: {str(e)}")
    
    # Note: gallery_upload and gallery_delete would require more complex multipart handling
    # For now, the PHP handlers will be used when PHP is available
    def handle_gallery_upload(self):
        """Handle gallery image upload - simplified version"""
        self.send_error(501, "Gallery upload requires PHP server for full functionality")
    
    def handle_gallery_delete(self):
        """Handle gallery image deletion - simplified version"""
        self.send_error(501, "Gallery delete requires PHP server for full functionality")

if __name__ == "__main__":
    run_server()
