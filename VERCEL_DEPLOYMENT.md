# Vercel Deployment Guide - Startup Investor Platform

## ⚠️ Important Note
Vercel is primarily designed for frontend applications and serverless functions. For a full FastAPI backend, **Render is recommended**. However, you can deploy your frontend on Vercel and backend on Render.

## Option 1: Frontend on Vercel + Backend on Render (Recommended)

### **Frontend Deployment on Vercel**

1. **Prepare Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create vercel.json in frontend directory**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-render-app.onrender.com/$1"
       }
   ]
   }
   ```

3. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel**
   ```
   VITE_API_URL=https://your-render-app.onrender.com
   ```

### **Backend on Render**
Follow the Render deployment guide above for the backend.

## Option 2: Full-Stack on Vercel (Advanced)

### **Create Vercel API Routes**

1. **Create api directory structure**
   ```
   api/
   ├── auth/
   │   ├── login.py
   │   └── signup.py
   ├── users/
   │   └── [id].py
   └── health.py
   ```

2. **Example API Route (api/health.py)**
   ```python
   from http.server import BaseHTTPRequestHandler
   import json
   import os
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker
   
   # Import your models
   import sys
   sys.path.append('backend')
   from Models.Auth_models import User
   from Database.db import get_db
   
   class handler(BaseHTTPRequestHandler):
       def do_GET(self):
           self.send_response(200)
           self.send_header('Content-type', 'application/json')
           self.end_headers()
           
           response = {
               "status": "healthy",
               "message": "API is running on Vercel"
           }
           
           self.wfile.write(json.dumps(response).encode())
           return
   ```

3. **Database Configuration for Vercel**
   ```python
   # api/db.py
   import os
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker
   
   DATABASE_URL = os.getenv("DATABASE_URL")
   
   if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
       DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
   
   engine = create_engine(DATABASE_URL)
   SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
   ```

### **Vercel Configuration**

1. **Create vercel.json in project root**
   ```json
   {
     "functions": {
       "api/**/*.py": {
         "runtime": "python3.9"
       }
     },
     "env": {
       "DATABASE_URL": "@database_url",
       "SECRET_KEY": "@secret_key"
     }
   }
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add SECRET_KEY
   ```

## Vercel-Specific Setup

### **Create Vercel Configuration Files**

1. **requirements.txt for Vercel**
   ```txt
   fastapi==0.115.12
   sqlalchemy==2.0.41
   psycopg2-binary==2.9.10
   python-jose[cryptography]==3.5.0
   passlib[bcrypt]==1.7.4
   python-multipart==0.0.20
   ```

2. **vercel.json (Full Configuration)**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "api/**/*.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/frontend/$1"
       }
     ],
     "env": {
       "DATABASE_URL": "@database_url",
       "SECRET_KEY": "@secret_key",
       "ENVIRONMENT": "production"
     }
   }
   ```

## Deployment Steps

### **Option 1: Frontend + Backend Separate**

1. **Deploy Backend to Render**
   - Follow Render deployment guide
   - Get your backend URL: `https://your-app.onrender.com`

2. **Deploy Frontend to Vercel**
   ```bash
   cd frontend
   # Update API URL in your frontend code
   # Replace localhost:8000 with your Render URL
   
   vercel --prod
   ```

3. **Configure CORS**
   - In Render backend, set:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

### **Option 2: Full-Stack on Vercel**

1. **Prepare API Routes**
   ```bash
   # Create api directory with your FastAPI routes
   mkdir -p api
   # Copy your backend logic to api routes
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Vercel Limitations & Solutions

### **Limitations:**
- **Cold starts**: Serverless functions have startup time
- **Database connections**: Need connection pooling
- **File uploads**: Limited to 4MB on free tier
- **Execution time**: 10 seconds limit on free tier

### **Solutions:**
1. **Use external database** (PostgreSQL on Render/Railway)
2. **Implement connection pooling** for database
3. **Use external storage** for file uploads (AWS S3, Cloudinary)
4. **Optimize cold starts** with proper imports

## Environment Variables for Vercel

### **Required:**
```
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-super-secret-key
ENVIRONMENT=production
```

### **Optional:**
```
ALLOWED_ORIGINS=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Vercel Pricing
- **Free tier**: 100GB bandwidth, 100 serverless function executions
- **Pro plan**: $20/month for unlimited functions
- **Enterprise**: Custom pricing

## Troubleshooting Vercel Issues

### **Common Errors:**

1. **"Module not found"**
   - Solution: Check Python path and imports
   - Use absolute imports

2. **Database connection fails**
   - Solution: Use external database (not Vercel's KV)
   - Check DATABASE_URL format

3. **CORS errors**
   - Solution: Configure ALLOWED_ORIGINS
   - Add Vercel domain to allowed origins

4. **Function timeout**
   - Solution: Optimize database queries
   - Use connection pooling

## Recommendation

**For your Startup Investor Platform, I recommend:**
- **Backend**: Deploy on Render (better for FastAPI)
- **Frontend**: Deploy on Vercel (better for React)
- **Database**: PostgreSQL on Render or Railway

This gives you the best of both worlds! 