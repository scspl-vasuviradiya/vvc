# Collection Management Server - Launcher Options

## 🚀 **Available Launchers:**

### 1. **`Quick-Start.bat`** ⭐ **RECOMMENDED**
- **Simple**: Just double-click and go!
- **Fast**: Minimal interface, starts immediately
- **Smart**: Auto-detects Python or Node.js
- **Clean**: Opens browser automatically

### 2. **`Start-Server.bat`** 
- **Detailed**: Shows full startup information
- **Interactive**: Press any key to stop server
- **Informative**: Displays server status and features
- **Professional**: Full status messages

### 3. **`Launch-Localhost-Server.bat`** 
- **Original**: The full-featured launcher
- **Options**: Install options if servers not found
- **Fallback**: File mode if no servers available
- **Complex**: Most comprehensive but might have detection issues

### 4. **`test-server.bat`**
- **Testing**: For troubleshooting server issues
- **Diagnostic**: Tests endpoints and connectivity
- **Debug**: Shows status codes and responses

## 🔧 **If Launchers Don't Work:**

### **Manual Python Start:**
```bash
python server.py
```
Then open: `http://localhost:8888/collection-management.html`

### **Manual Node.js Start:**
```bash
node server.js  
```
Then open: `http://localhost:8888/collection-management.html`

## 📋 **Features Available:**

✅ **All launchers provide:**
- Collections save to `collections.json` file
- Images upload to `img/collections/` folder
- Full CORS support
- Automatic backups
- Error handling
- Port 8888 (avoids IIS conflicts)

## 🛠️ **Troubleshooting:**

### **"Server not found" errors:**
1. **Try `Quick-Start.bat`** first (simplest)
2. **Check** Python: `python --version`
3. **Check** Node.js: `node --version`
4. **Manual start** if launchers fail

### **Port 8080 conflicts:**
- **Fixed**: All launchers now use port 8888
- **Avoids**: IIS and other common conflicts

### **Browser doesn't open:**
- **Manually open**: `http://localhost:8888/collection-management.html`
- **Check firewall**: Allow localhost connections
- **Try different browser**: Chrome, Firefox, Edge

### **Collections don't save:**
1. **Keep server window open**
2. **Check browser console** (F12) for errors
3. **Verify server is running** on correct port
4. **Test with `test-server.bat`**

## 💡 **Best Practice:**

**For daily use**: `Quick-Start.bat`
**For troubleshooting**: `Start-Server.bat` 
**For testing**: `test-server.bat`

The collection management system is designed to work reliably with multiple fallback options. If one launcher doesn't work, try another!

## 📁 **File Structure:**

```
your-project/
├── Quick-Start.bat              ⭐ Recommended
├── Start-Server.bat             📋 Detailed  
├── Launch-Localhost-Server.bat  🔧 Full-featured
├── test-server.bat              🧪 Testing
├── server.py                    🐍 Python server
├── server.js                    📦 Node.js server
├── collection-management.html   🌐 Main interface
└── collections.json             💾 Data file
```

**Just pick the launcher that works best for you! 🎯**