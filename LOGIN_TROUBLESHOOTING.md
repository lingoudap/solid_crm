# Login Troubleshooting Checklist

## ✅ Quick Tests

### 1. Check if Backend Server is Running
```powershell
# In PowerShell, go to server directory
cd server
npm start

# You should see:
# ✅ MongoDB connected successfully!
# App running on port 5000
```

### 2. Check MongoDB is Running
```powershell
# Check if MongoDB is running (Windows)
# Open Task Manager → Search for "mongod"
# Or run:
Get-Process mongod | Select-Object ProcessName, Id
```

### 3. Test Login Endpoint Directly
```powershell
# Open PowerShell and test the login endpoint
$body = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### 4. Check Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Try logging in
- Copy any error messages shown

### 5. Check Network Request
- Open browser DevTools (F12)
- Go to Network tab
- Try logging in
- Click on the request to `/api/login`
- Check Response tab for error message

---

## 🔍 Common Issues & Solutions

### Issue 1: "Server Error" or Connection Refused
**Solution:** Backend server is not running
```powershell
cd d:\Lingouda\App\CRM\solid_crm\server
npm start
```

### Issue 2: "MongoDB connection failed"
**Solution:** MongoDB service is not running
- Windows: Start MongoDB service
- Or check if MongoDB is installed

### Issue 3: "User not found"
**Solution:** Incorrect email or user doesn't exist in database
- Make sure you registered first
- Check email spelling exactly
- Try registering a new account

### Issue 4: "Invalid password"
**Solution:** Incorrect password
- Make sure Caps Lock is off
- Try re-registering with a known password

---

## Try This First

1. Open terminal/PowerShell
2. Navigate to server directory:
   ```powershell
   cd d:\Lingouda\App\CRM\solid_crm\server
   ```
3. Start the server:
   ```powershell
   npm start
   ```
4. Check for these messages:
   - ✅ "MongoDB connected successfully!"
   - ✅ "App running on port 5000"
5. If you see errors, share them with me

---

## Please Provide:

When you reply, include:
1. **Exact error message** you're seeing
2. **Output from server startup** (copy-paste from terminal)
3. **Whether MongoDB is running** (yes/no)
4. **Browser console errors** (if any, copy-paste from DevTools)

This will help me fix the issue quickly!
