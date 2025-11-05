# Render Platform Setup Guide

## Overview
This guide will help you deploy your Gym Admin Dashboard to Render platform. Render provides persistent disk storage which is perfect for WhatsApp authentication files.

---

## Prerequisites
1. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
2. **GitHub Repository**: Your code must be pushed to GitHub
3. **Turso Database**: Already set up with your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
4. **Node.js**: Render supports Node.js 20 (specified in `package.json`)

---

## Step 1: Connect GitHub Repository

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Sign in or create an account

2. **Connect GitHub**
   - Click "New +" → "Web Service"
   - Click "Connect account" next to GitHub
   - Authorize Render to access your repositories
   - Select your repository: `GymAdminDashboard`

---

## Step 2: Create Web Service

1. **Import Repository**
   - Render will auto-detect your `render.yaml` file
   - OR manually configure:
     - **Name**: `gym-admin-dashboard` (or your preferred name)
     - **Region**: Choose closest to your users (e.g., `Oregon`, `Singapore`)
     - **Branch**: `main` (or your default branch)
     - **Root Directory**: Leave empty (root of repo)

2. **Build & Start Commands**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20` (auto-detected from `package.json`)

3. **Environment Variables**
   Click "Environment" tab and add:
   
   ```
   NODE_ENV=production
   PORT=10000
   RENDER=1
   TURSO_DATABASE_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```
   
   **Important**: 
   - Replace `your-database-url.turso.io` with your actual Turso database URL
   - Replace `your-auth-token-here` with your actual Turso auth token
   - Get these from [Turso Dashboard](https://turso.tech)

4. **Health Check**
   - **Path**: `/api/health`
   - Render will ping this to verify your service is running

---

## Step 3: Add Persistent Disk (For WhatsApp Auth)

**This is CRITICAL for WhatsApp to work!**

1. **Go to Disk Settings**
   - In your service dashboard, click "Disks" tab
   - Click "Create Disk"

2. **Configure Disk**
   - **Name**: `auth_storage`
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: `1 GB` (minimum, enough for auth files)
   - Click "Create Disk"

3. **Verify**
   - After deployment, WhatsApp auth files will be stored in:
     ```
     /opt/render/project/src/auth_info_baileys/
     ```
   - These files persist across deployments and restarts

---

## Step 4: Deploy

1. **Manual Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push to GitHub to trigger automatic deploy

2. **Monitor Deployment**
   - Watch the build logs for any errors
   - First deployment takes 5-10 minutes
   - Subsequent deployments are faster

3. **Verify Deployment**
   - Check logs for: `serving on port 10000`
   - Visit your service URL (provided by Render)
   - Test `/api/health` endpoint

---

## Step 5: Verify Database Connection

1. **Check Logs**
   - Look for: `DB init - URL exists: true Token exists: true`
   - Look for: `DB client created successfully`

2. **Test API**
   - Visit: `https://your-service.onrender.com/api/health`
   - Should return: `{"ok":true,"db":"turso","counts":{...}}`

---

## Step 6: Setup WhatsApp (After Deployment)

1. **Access WhatsApp Page**
   - Go to: `https://your-service.onrender.com/whatsapp`
   - Click "Generate QR Code"

2. **Scan QR Code**
   - Open WhatsApp on your phone
   - Settings → Linked Devices → Link a Device
   - Scan the QR code shown on screen

3. **Verify Connection**
   - Status should change to "Connected ✅"
   - You can now send bulk messages

---

## Important Notes

### Environment Variables Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` | Render's default port |
| `RENDER` | `1` | Enables Render-specific paths |
| `TURSO_DATABASE_URL` | Your Turso URL | Database connection |
| `TURSO_AUTH_TOKEN` | Your Turso token | Database authentication |

### File Structure on Render

```
/opt/render/project/src/
├── auth_info_baileys/     ← WhatsApp auth files (persistent)
├── server/
├── client/
├── dist/
└── package.json
```

### Common Issues & Solutions

1. **"Missing TURSO_DATABASE_URL"**
   - Check environment variables are set correctly
   - Verify no typos in variable names

2. **"WhatsApp auth files lost"**
   - Ensure persistent disk is mounted
   - Check `AUTH_DIR` path in logs

3. **"Build fails"**
   - Check Node.js version (must be 20)
   - Verify all dependencies in `package.json`

4. **"Service crashes"**
   - Check logs for error messages
   - Verify `/api/health` endpoint works
   - Check database connectivity

### Monitoring & Logs

1. **View Logs**
   - Dashboard → Your Service → "Logs" tab
   - Real-time logs available
   - Search for errors

2. **Health Checks**
   - Render automatically checks `/api/health`
   - Service marked unhealthy if checks fail
   - Check logs for health check failures

---

## Step 7: Custom Domain (Optional)

1. **Add Custom Domain**
   - Service → "Settings" → "Custom Domains"
   - Enter your domain (e.g., `dashboard.yourgym.com`)
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Render automatically provides SSL
   - Takes 5-10 minutes to provision

---

## Cost Estimate (Free Tier)

- **Web Service**: Free (with limitations)
  - 750 hours/month free
  - Sleeps after 15 minutes of inactivity
  - Wakes up on first request (takes ~30 seconds)

- **Persistent Disk**: Free
  - 1 GB included in free tier

- **Upgrade to Starter Plan** ($7/month):
  - Always-on service
  - No sleep/wake delays
  - Better for production use

---

## Deployment Checklist

- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Environment variables set
- [ ] Persistent disk created and mounted
- [ ] First deployment successful
- [ ] Database connection verified (`/api/health`)
- [ ] WhatsApp QR code generation tested
- [ ] Custom domain configured (optional)

---

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Status**: [status.render.com](https://status.render.com)
- **Turso Docs**: [docs.turso.tech](https://docs.turso.tech)

---

## Quick Reference Commands

```bash
# Local testing (mimics Render)
export RENDER=1
export PORT=10000
export TURSO_DATABASE_URL=your-url
export TURSO_AUTH_TOKEN=your-token
npm run build
npm start

# Check service health
curl https://your-service.onrender.com/api/health

# View logs (in Render dashboard)
# Service → Logs tab
```

---

**Good luck with your deployment! 🚀**

