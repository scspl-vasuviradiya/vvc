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
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/save-collections.php':
            self.handle_save_collections()
        elif self.path == '/upload-image.php':
            self.handle_upload_image()
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

if __name__ == "__main__":
    run_server()