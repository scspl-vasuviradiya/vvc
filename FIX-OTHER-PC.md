# Fix for Collection Management on Other PC

## 🔧 **Problem:**
- Launcher starts Node.js but crashes when trying to install `http-server`
- Node.js `http-server` can only serve static files (no PHP endpoints)
- Collections won't save and images won't upload
- IIS conflicts on port 8080 (now using port 8888)

## ✅ **Solution - Files Added:**

### 1. **`server.js`** - Node.js server with full functionality
- Handles `/save-collections.php` endpoint
- Handles `/upload-image.php` endpoint  
- Serves static files (HTML, CSS, JS, images)
- Full CORS support for localhost development

### 2. **`test-server.bat`** - Quick test script
- Tests if Node.js server works correctly
- Verifies endpoints are responding
- Easy troubleshooting

### 3. **Updated `Launch-Localhost-Server.bat`**
- Now uses custom `server.js` instead of `http-server` 
- Better error handling and messages

## 🚀 **How to Fix on Other PC:**

### Step 1: Copy Files
Copy these files from this PC to your other PC:
```
server.js           ← NEW! Node.js server
Node-Start.bat      ← NEW! Node.js specific launcher  
Check-System.bat    ← NEW! System diagnostic
test-server.bat     ← NEW! Test script  
Launch-Localhost-Server.bat  ← Updated launcher
```

### Step 2: Check Your System
1. Double-click **`Check-System.bat`**
2. This will show you what's available on your PC:
   ```
   ✓ FOUND: Node.js v16.x.x (or similar)
   ✓ server.js found
   ✅ GOOD OPTION: Use Node.js server
   ```

### Step 3: Use the Node.js Launcher
1. Double-click **`Node-Start.bat`** 
2. This launcher is specifically designed for Node.js:
   - Detects Node.js reliably
   - Starts the custom `server.js`
   - Tests server connection
   - Opens browser automatically

### Step 4: Alternative - Test Server
1. If Node-Start.bat doesn't work, try **`test-server.bat`**
2. You should see:
   ```
   HTML Status: 200
   Collections Status: 200
   ```
   - Open browser with full functionality

## 🔍 **What Changed:**

### Before (Broken):
```
Node.js → http-server → Only static files → No save/upload
```

### After (Fixed):  
```
Node.js → server.js → Full functionality → Save + Upload works!
```

## 📋 **Features Now Available:**

✅ **Collections save to `collections.json`** (real file)  
✅ **Images upload to `img/collections/`** (real folder)  
✅ **Automatic backups** before saving  
✅ **Full error handling** and validation  
✅ **CORS support** for browser requests  

## 🛠️ **Troubleshooting:**

### If launcher still doesn't work:
1. **Run `test-server.bat` first** to verify Node.js server works
2. **Check that `server.js` exists** in the same folder
3. **Make sure Node.js is installed** (`node --version`)
4. **Try running manually:**
   ```bat
   node server.js
   ```

### If you see "server.js not found":
- Copy `server.js` from this PC to the other PC
- Make sure it's in the same folder as the HTML files

### If collections still don't save:
- Check that the server window stays open
- Look for error messages in the console
- Verify `collections.json` exists in the folder

## ✨ **Why This Works:**

The original launcher was trying to use Node.js's `http-server` package, which:
1. Needs to be installed globally (`npm install -g http-server`)
2. Only serves static files 
3. Can't process PHP-like endpoints

The new `server.js`:
1. Uses built-in Node.js modules (no installation needed)
2. Handles both static files AND API endpoints
3. Emulates the PHP functionality for collections and image uploads

## 🎯 **Result:**

Your other PC will now have the same full functionality as this one:
- Collections save directly to files
- Images upload to the img/collections/ folder  
- No more localStorage-only limitations
- Professional server-client architecture

**Just copy the files and run the launcher! 🚀**