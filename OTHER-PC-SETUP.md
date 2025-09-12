# Setup Guide for Other PC

## 📥 **Files to Copy from Main PC:**

Copy these files to your other PC:

### ✅ **Essential Files:**
```
collection-management.html
collection-management.css
collection-management.js
collections.json
server.js              ← Node.js server
```

### ✅ **Launchers (copy all):**
```
Node-Start.bat         ← Recommended for Node.js PC
Check-System.bat       ← Diagnostic tool
test-server.bat        ← Testing tool  
Quick-Start.bat        ← Works if Python is available
Launch-Localhost-Server.bat  ← Original (might have detection issues)
```

### ✅ **Folders:**
```
img/                   ← Copy entire folder
  └── collections/     ← Image upload folder
  └── logo/           ← Logo files
styles.css            ← Main stylesheet
animations.js         ← Animation scripts
```

## 🚀 **Step-by-Step Setup:**

### Step 1: Copy All Files
1. **Create folder** on other PC (e.g., `C:\Projects\vvc`)
2. **Copy all files** from main PC to this folder
3. **Maintain folder structure** (keep img/ folder intact)

### Step 2: Check System
1. **Double-click** `Check-System.bat`
2. **Look for**:
   ```
   ✓ FOUND: Node.js v22.x.x
   ✓ server.js found
   ✅ GOOD OPTION: Use Node.js server
   ```

### Step 3: Start Server
1. **Double-click** `Node-Start.bat`
2. **Should show**:
   ```
   [INFO] Node.js version: v22.x.x
   [INFO] All required files found
   [INFO] Starting server...
   [SUCCESS] Server is responding!
   ```
3. **Browser opens** automatically to collection management

## ⚠️ **If Problems Occur:**

### Problem: "Node.js not found"
**Solution:**
1. Install Node.js from https://nodejs.org
2. **Choose LTS version** (recommended)
3. **Restart command prompt** after installation
4. **Run Check-System.bat** to verify

### Problem: "server.js not found"
**Solution:**
1. **Copy server.js** from main PC
2. **Place in same folder** as HTML files
3. **Check file size** - should be around 8KB

### Problem: "Detection failing in launchers"
**Solution:**
1. **Try Node-Start.bat** (most reliable for Node.js)
2. **Manual start**: Open command prompt, type `node server.js`
3. **Open browser**: Go to `http://localhost:8888/collection-management.html`

### Problem: "Port 8080 conflicts"
**Note:** All new launchers use port 8888 to avoid conflicts

## 🧪 **Testing Everything Works:**

### Test 1: System Check
```bat
Double-click: Check-System.bat
Expected: Shows Node.js found + all files found
```

### Test 2: Server Test
```bat
Double-click: test-server.bat  
Expected: HTML Status: 200, Collections Status: 200
```

### Test 3: Full Launch
```bat
Double-click: Node-Start.bat
Expected: Server starts + browser opens + collection management loads
```

### Test 4: Save Function
1. **Add a test collection** with sample data
2. **Click Save Collection**  
3. **Check** if `collections.json` file is updated
4. **Check** if image uploads to `img/collections/`

## 📋 **Launcher Priority for Other PC:**

### 1st Choice: `Node-Start.bat` ⭐
- **Designed for Node.js systems**
- **Reliable detection**
- **Full error messages**

### 2nd Choice: `Check-System.bat` + Manual
- **Diagnose what's available**
- **Manual command**: `node server.js`

### 3rd Choice: `test-server.bat`
- **Quick functionality test**
- **Shows if endpoints work**

## ✅ **Success Indicators:**

When everything is working correctly:
- ✅ Node-Start.bat opens without errors
- ✅ Browser opens to collection management page
- ✅ Collections load from collections.json
- ✅ "Localhost Mode" message appears in interface
- ✅ Collections save directly to files
- ✅ Images upload to img/collections/ folder

## 🎯 **Final Result:**

Your other PC will have **identical functionality** to the main PC:
- **Real file saving** (not just browser storage)
- **Image uploads** to actual folders
- **Automatic backups** before saving
- **Professional server-client architecture**

**The system will work exactly the same on both PCs! 🎉**

---

## 📞 **Quick Troubleshooting:**

**If nothing works:**
1. ✅ Node.js installed? → `node --version`
2. ✅ Files copied? → `Check-System.bat`  
3. ✅ Server starts? → `node server.js` manually
4. ✅ Browser opens? → `http://localhost:8888/collection-management.html`

**Most common issue:** Node.js PATH not set after installation → **Restart command prompt!**