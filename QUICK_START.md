# Quick Start - Essential Commands

## 🚀 Fast Setup (Copy & Paste)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

✅ **Backend running on:** http://localhost:5000

### Step 3: Start Frontend (Terminal 2 - New Window)

```bash
cd frontend
npm run dev
```

✅ **Frontend running on:** http://localhost:3000

---

## 📝 Environment Variables

### Backend `.env` (already configured)

Location: `backend/.env`

```
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
```

**Create manually if missing:**
- Windows: Create `backend\.env` file with above content
- Linux/Mac: `touch backend/.env` then add content

---

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Already Configured) ✅

Your connection string is already in `.env`. No setup needed!

### Option 2: Local MongoDB

**Install:**
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**Start Service:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Update `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/chachu_client_management
```

---

## 🔧 Common Commands

### Backend

```bash
cd backend

# Development (with auto-reload)
npm run dev

# Production
npm start

# Install dependencies
npm install
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install
```

---

## ✅ Verify Setup

### 1. Check Backend
```bash
# Windows PowerShell
Invoke-WebRequest http://localhost:5000/health

# Windows CMD / Linux / Mac
curl http://localhost:5000/health
```

**Expected:** `{"status":"OK","message":"Server is running"}`

### 2. Check Frontend
Open browser: http://localhost:3000

### 3. Check MongoDB Connection
Look for this in backend console:
```
MongoDB connected successfully
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Kill process on port 5000 (Backend):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Kill process on port 3000 (Frontend):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

```bash
# Delete node_modules and reinstall
rm -rf node_modules  # Linux/Mac
rmdir /s /q node_modules  # Windows CMD
Remove-Item -Recurse -Force node_modules  # Windows PowerShell

npm install
```

### MongoDB Connection Error

1. Check `.env` file exists in `backend/` folder
2. Verify MongoDB Atlas cluster is running
3. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0)

---

## 📚 Full Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)



