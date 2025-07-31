# Render Deployment Guide - Startup Investor Platform

## Step-by-Step Render Deployment

### 1. **Prepare Your Repository**
Make sure your code is pushed to GitHub with these files:
- `backend/requirements.txt`
- `backend/main.py`
- `backend/migrate_db.py`
- `backend/Database/db.py`
- All other backend files

### 2. **Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 3. **Create New Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name**: `startup-investor-api` (or your preferred name)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy Settings:**
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### 4. **Add PostgreSQL Database**
1. Go to "New +" → "PostgreSQL"
2. Name: `startup-investor-db`
3. Choose the same region as your web service
4. Plan: Free (for testing) or paid plan for production

### 5. **Configure Environment Variables**
In your web service settings, add these environment variables:

**Required:**
```
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random-123456789
ENVIRONMENT=production
```

**Optional:**
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 6. **Link Database to Web Service**
1. In your web service settings
2. Go to "Environment" tab
3. Add the `DATABASE_URL` from your PostgreSQL service
4. The format will be: `postgresql://user:password@host/database`

### 7. **Deploy**
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete (usually 2-5 minutes)

### 8. **Verify Deployment**
1. Check the deployment logs for any errors
2. Test your API endpoints:
   ```bash
   curl https://your-app-name.onrender.com/health
   ```

## Render-Specific Configuration

### **Create render.yaml (Optional)**
Create this file in your project root for automated deployments:

```yaml
services:
  - type: web
    name: startup-investor-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: startup-investor-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ENVIRONMENT
        value: production

databases:
  - name: startup-investor-db
    databaseName: startup_investor
    user: startup_investor_user
```

## Troubleshooting Render Issues

### **Common Errors:**

1. **"no such table: users"**
   - Solution: Check that `migrate_db.py` is running in start command
   - Verify `DATABASE_URL` is set correctly

2. **Build fails**
   - Check `requirements.txt` exists in backend folder
   - Verify Python version compatibility

3. **Database connection fails**
   - Ensure PostgreSQL service is created and linked
   - Check `DATABASE_URL` format

4. **CORS errors**
   - Set `ALLOWED_ORIGINS` environment variable
   - Include your frontend domain

### **Useful Render Commands:**
```bash
# Check logs
# Use Render dashboard → Logs tab

# SSH into instance (if needed)
# Use Render dashboard → Shell tab
```

## Render Pricing
- **Free tier**: 750 hours/month, 512MB RAM
- **Paid plans**: $7/month for 1GB RAM, $25/month for 2GB RAM
- **PostgreSQL**: Free tier available, paid plans from $7/month

## Next Steps
1. Set up custom domain (optional)
2. Configure SSL certificate (automatic with Render)
3. Set up monitoring and alerts
4. Configure backups for database 