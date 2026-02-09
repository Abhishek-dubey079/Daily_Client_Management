# npm run dev Error Fix

## Problem
The `backend/package.json` file was empty, causing the error:
```
npm error code EJSONPARSE
npm error JSON.parse Invalid package.json: JSONParseError: Unexpected end of JSON input
```

## Solution
Created a proper `package.json` file for the backend with all required dependencies:

### Dependencies:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing

### Dev Dependencies:
- `nodemon` - Auto-restart on file changes

### Scripts:
- `npm run dev` - Runs server with nodemon (auto-restart)
- `npm start` - Runs server with node

## Verification
✅ Package.json created
✅ Dependencies installed
✅ Nodemon installed
✅ Server should now start with `npm run dev`

## Usage
```bash
cd backend
npm run dev
```

The server will start on port 5000 (or PORT from .env) and auto-restart on file changes.



