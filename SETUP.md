# Setup Guide - Terminal Commands

Complete setup instructions for running the Chachu Client Management System.

## Prerequisites

- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB Atlas account (or local MongoDB)

---

## 1. Environment Variables Setup

### Backend Environment Variables

Navigate to the backend directory and create/update the `.env` file:

```bash
cd backend
```

**Windows (PowerShell):**
```powershell
# Create .env file if it doesn't exist
if (!(Test-Path .env)) {
    New-Item -ItemType File -Name .env
}

# Set environment variables
@"
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

**Windows (CMD):**
```cmd
cd backend
echo PORT=5000 > .env
echo MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0 >> .env
echo JWT_SECRET=chachu_client_management_secret_key_2024 >> .env
echo NODE_ENV=development >> .env
```

**Linux/Mac:**
```bash
cd backend
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
EOF
```

**Or manually create `.env` file in `backend/` folder:**
```
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
```

### Frontend Environment Variables (Optional)

The frontend uses default values, but you can create a `.env` file if needed:

```bash
cd frontend
```

**Create `.env` file:**
```
VITE_API_URL=http://localhost:5000
```

---

## 2. MongoDB Setup

### Option A: Using MongoDB Atlas (Cloud - Already Configured)

Your MongoDB connection string is already configured in the `.env` file. No additional setup needed!

**Verify Connection:**
- The backend will automatically connect when you start it
- Check console for "MongoDB connected successfully" message

### Option B: Local MongoDB Setup

If you want to use local MongoDB instead:

**Install MongoDB:**
- Windows: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**Start MongoDB Service:**

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Update `.env` file:**
```
MONGODB_URI=mongodb://localhost:27017/chachu_client_management
```

---

## 3. Install Dependencies

### Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install
```

**Expected output:**
```
added 150 packages in 30s
```

### Frontend Dependencies

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install all dependencies
npm install
```

**Expected output:**
```
added 200 packages in 45s
```

---

## 4. Run Backend

### Development Mode (with auto-reload)

```bash
# Make sure you're in backend directory
cd backend

# Start development server
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB connected successfully
```

**The backend will be available at:** `http://localhost:5000`

### Production Mode

```bash
cd backend
npm start
```

### Verify Backend is Running

**Test health endpoint:**
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health

# Windows CMD
curl http://localhost:5000/health

# Linux/Mac
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"OK","message":"Server is running"}
```

---

## 5. Run Frontend

### Development Mode

**Open a NEW terminal window** (keep backend running in the first terminal):

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**The frontend will be available at:** `http://localhost:3000`

### Production Build

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 6. Complete Setup Checklist

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Verify Everything Works

1. **Backend:** Open `http://localhost:5000/health` in browser
2. **Frontend:** Open `http://localhost:3000` in browser
3. **Register:** Create a new account
4. **Login:** Login with your credentials
5. **Add Client:** Create a test client with a reminder

---

## 7. Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend (Port 3000):**
```bash
# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### MongoDB Connection Error

**Check connection string:**
```bash
# Verify .env file exists and has correct MONGODB_URI
cd backend
type .env  # Windows CMD
cat .env   # Linux/Mac/PowerShell
```

**Test MongoDB connection:**
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas (should allow all IPs: 0.0.0.0/0)
- Verify username/password in connection string

### Module Not Found Errors

**Clear node_modules and reinstall:**
```bash
# Backend
cd backend
rmdir /s /q node_modules  # Windows CMD
Remove-Item -Recurse -Force node_modules  # Windows PowerShell
rm -rf node_modules  # Linux/Mac
npm install

# Frontend
cd frontend
rmdir /s /q node_modules  # Windows CMD
Remove-Item -Recurse -Force node_modules  # Windows PowerShell
rm -rf node_modules  # Linux/Mac
npm install
```

### Environment Variables Not Loading

**Verify .env file location:**
- Backend `.env` should be in `backend/` folder
- Frontend `.env` (if used) should be in `frontend/` folder

**Check file encoding:**
- Ensure `.env` file is UTF-8 encoded
- No BOM (Byte Order Mark)

---

## 8. Quick Start Scripts

### Windows PowerShell - Quick Start

Create `start-backend.ps1`:
```powershell
cd backend
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..."
    @"
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
}
npm install
npm run dev
```

Create `start-frontend.ps1`:
```powershell
cd frontend
npm install
npm run dev
```

**Run:**
```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2
.\start-frontend.ps1
```

### Linux/Mac - Quick Start

Create `start-backend.sh`:
```bash
#!/bin/bash
cd backend
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://AbhishekDubey:iBLIKabAhDzVD96Z@cluster0.lzofbxi.mongodb.net/?appName=Cluster0
JWT_SECRET=chachu_client_management_secret_key_2024
NODE_ENV=development
EOF
fi
npm install
npm run dev
```

Create `start-frontend.sh`:
```bash
#!/bin/bash
cd frontend
npm install
npm run dev
```

**Make executable and run:**
```bash
chmod +x start-backend.sh start-frontend.sh

# Terminal 1
./start-backend.sh

# Terminal 2
./start-frontend.sh
```

---

## 9. Production Deployment

### Build Frontend for Production

```bash
cd frontend
npm run build
```

**Output:** `frontend/dist/` folder contains production files

### Environment Variables for Production

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
```

**Important:** Use a strong, random JWT_SECRET in production!

### Start Production Server

```bash
cd backend
npm start
```

---

## Summary

**Complete setup in 3 steps:**

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

That's it! 🎉



