# Vivah Villa Collection - Server Setup Guide

## Quick Start

### Option 1: Using Batch File (Recommended)
1. Double-click `start-server.bat`
2. Server will start on port 8888
3. Open: http://localhost:8888/gallery-management.html

### Option 2: Manual Start
```bash
node server.js
```

## Available URLs
- **Collection Management**: http://localhost:8888/collection-management.html
- **Gallery Management**: http://localhost:8888/gallery-management.html
- **Home Page**: http://localhost:8888/index.html

## API Endpoints

### Working with Node.js Server (Full Featured!)
- ✅ `GET /gallery-list.php` - List gallery images
- ✅ `GET /gallery-manifest.php` - Get gallery statistics  
- ✅ `POST /gallery-manifest.php` - Update gallery statistics
- ✅ `POST /gallery-upload.php` - Upload gallery images
- ✅ `POST /gallery-delete.php` - Delete gallery images
- ✅ `GET /save-collections.php` - Get collections
- ✅ `POST /save-collections.php` - Save collections
- ✅ `POST /upload-image.php` - Upload collection images

## Troubleshooting

### "ERR_EMPTY_RESPONSE" Error
This usually means:
1. **Server not running** - Start the server using `start-server.bat`
2. **Port conflict** - The server uses port 8888 by default
3. **Firewall blocking** - Allow Node.js through Windows Firewall

### Gallery Not Loading
1. Check if `img/gallery/Male/` and `img/gallery/Female/` directories exist
2. Ensure image files have numeric names (1.jpg, 2.png, etc.)
3. Check browser console for errors (F12 → Console)

### Multiple Node Processes
If you get "port already in use" errors:
```bash
taskkill /F /IM node.exe
```

## File Structure
```
vvc/
├── img/
│   ├── gallery/
│   │   ├── Male/          # Male gallery images (1.jpg, 2.jpg, etc.)
│   │   └── Female/        # Female gallery images (1.jpg, 2.jpg, etc.)
│   └── collections/       # Collection preview images
├── server.js              # Node.js server
├── start-server.bat       # Quick start script
├── gallery-management.html
├── collection-management.html
└── gallery-management.js
```

## Features by Server Type

### Node.js Server (Current - Full Featured!)
- ✅ View gallery images
- ✅ Gallery statistics (auto-updated)
- ✅ Collection management (full CRUD)
- ✅ Cross-navigation between pages
- ✅ Upload new gallery images
- ✅ Delete gallery images (single & bulk)
- ✅ Automatic file sequencing
- ✅ File validation (type, size)
- ✅ Manifest management
