# Vercel Deployment Guide

## Project Structure

This project is configured for Vercel deployment with:
- **Frontend**: React + Vite (builds to `frontend/dist/`)
- **Backend**: Express serverless functions (in `api/` folder)
- **Database**: MongoDB (via environment variables)

## Configuration Files

### `vercel.json`
- Configures build command to build frontend
- Routes `/api/*` requests to serverless functions
- Serves static files from `frontend/dist/`
- Falls back to `index.html` for client-side routing

### `api/index.js`
- Serverless function handler for all API routes
- Handles MongoDB connection with connection pooling
- Exports Express app as Vercel serverless function

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

1. **MONGODB_URI**: Your MongoDB connection string
2. **JWT_SECRET**: Secret key for JWT token generation
3. **NODE_ENV**: Set to `production` for production deployments

## Deployment Steps

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`

4. **Redeploy** after setting environment variables

## How It Works

1. **Build Process**:
   - Vercel runs `cd frontend && npm install && npm run build`
   - Frontend builds to `frontend/dist/`
   - Output directory is set to `frontend/dist`

2. **Routing**:
   - `/api/*` → Serverless function (`api/index.js`)
   - Static assets (JS, CSS, images) → Served from `frontend/dist/`
   - All other routes → `index.html` (for React Router)

3. **API Routes**:
   - `/api/auth/*` → Authentication endpoints
   - `/api/clients/*` → Client management endpoints
   - `/api/health` → Health check endpoint

## Troubleshooting

### Error: "ENOENT: no such file or directory, stat '/var/frontend/dist/index.html'"

**Solution**: The build output directory is correctly set to `frontend/dist` in `vercel.json`. Make sure:
- Frontend build completes successfully
- `frontend/dist/index.html` exists after build
- `outputDirectory` in `vercel.json` points to `frontend/dist`

### API Routes Not Working

**Check**:
- Environment variables are set in Vercel
- MongoDB connection string is correct
- JWT_SECRET is set
- Check Vercel function logs for errors

### Frontend Not Loading

**Check**:
- Build completed successfully
- `frontend/dist/index.html` exists
- Static assets are being served correctly
- Check browser console for errors

## Local Development

For local development, use:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

The frontend will proxy `/api` requests to `http://localhost:5000` in development.

## Production API URL

In production, the frontend automatically uses `/api` as the base URL, which Vercel routes to the serverless functions. No configuration needed!


