# Login Debugging Guide

## Issues Fixed

### 1. Backend Improvements
- ✅ Added comprehensive logging in login route
- ✅ Added email normalization (lowercase, trim)
- ✅ Added JWT_SECRET verification
- ✅ Improved error messages (distinct for user not found vs wrong password)
- ✅ Added password hash verification logging
- ✅ Added register route logging

### 2. Frontend Improvements
- ✅ Added Content-Type header (application/json)
- ✅ Added request/response interceptors with logging
- ✅ Added detailed error logging in Login component
- ✅ Added token and user storage verification
- ✅ Improved error messages

### 3. Server Startup
- ✅ Added environment variable verification
- ✅ Added MongoDB connection logging
- ✅ Added JWT_SECRET check on startup

## How to Debug Login Issues

### Step 1: Check Backend Logs

When you try to login, check the backend terminal for:

```
=== LOGIN ATTEMPT ===
Received email: user@example.com
Password provided: Yes
Normalized email: user@example.com
User found: Yes/No
User ID: ...
Password match result: true/false
```

### Step 2: Check Frontend Console

Open browser DevTools (F12) and check Console tab for:

```
=== FRONTEND LOGIN ATTEMPT ===
Email: user@example.com
Sending login request to: /auth/login
Login response received: { status: 200, hasToken: true, hasUser: true }
Token stored in localStorage: true
```

### Step 3: Verify Environment Variables

Check backend terminal on startup:
```
=== SERVER STARTUP ===
PORT: 5000
MONGODB_URI: Set
JWT_SECRET: Set
```

### Step 4: Test Registration First

1. Try registering a new user
2. Check backend logs for password hash creation
3. Verify user is saved to database

### Step 5: Test Login

1. Use the registered email and password
2. Check both backend and frontend logs
3. Verify token is stored in localStorage

## Common Issues and Solutions

### Issue: "Invalid credentials"
- **Check:** Backend logs show "User found: No"
- **Solution:** User doesn't exist, register first

### Issue: "Invalid email or password" (after user found)
- **Check:** Backend logs show "Password match result: false"
- **Solution:** Password is incorrect, check password input

### Issue: "JWT_SECRET is not set"
- **Check:** Backend startup logs
- **Solution:** Verify `.env` file exists and has JWT_SECRET

### Issue: "MongoDB connection error"
- **Check:** Backend startup logs
- **Solution:** Verify MONGODB_URI in `.env` file

### Issue: Token not stored
- **Check:** Frontend console logs
- **Solution:** Check browser localStorage, clear and try again

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connects successfully
- [ ] JWT_SECRET is loaded
- [ ] Can register new user
- [ ] Password is hashed in database
- [ ] Can login with registered credentials
- [ ] Token is returned in response
- [ ] Token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] User data is stored in localStorage


