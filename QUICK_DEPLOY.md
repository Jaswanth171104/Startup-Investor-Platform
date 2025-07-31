# 🚀 Quick Deployment Reference

## **Render (Backend) - RECOMMENDED**

### **Step 1: Prepare Repository**
```bash
git add .
git commit -m "Deployment ready"
git push origin main
```

### **Step 2: Deploy on Render**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create "New Web Service"
4. Connect your repository

### **Step 3: Configure Service**
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### **Step 4: Add PostgreSQL Database**
1. Create "New PostgreSQL"
2. Copy the `DATABASE_URL`
3. Add to environment variables

### **Step 5: Set Environment Variables**
```
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ENVIRONMENT=production
```

### **Step 6: Deploy**
Click "Create Web Service" and wait for deployment.

---

## **Vercel (Frontend)**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

### **Step 2: Update Frontend API URL**
In your frontend code, replace:
```javascript
// Change from:
const API_URL = 'http://localhost:8000'

// To:
const API_URL = 'https://your-render-app.onrender.com'
```

### **Step 3: Deploy Frontend**
```bash
cd frontend
vercel --prod
```

### **Step 4: Configure CORS**
In your Render backend, add your Vercel domain to `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## **Environment Variables Checklist**

### **Render (Backend)**
- [ ] `DATABASE_URL` (from PostgreSQL)
- [ ] `SECRET_KEY` (generate strong key)
- [ ] `ENVIRONMENT=production`
- [ ] `ALLOWED_ORIGINS` (your frontend domain)

### **Vercel (Frontend)**
- [ ] `VITE_API_URL` (your Render backend URL)

---

## **Quick Test Commands**

### **Test Backend**
```bash
curl https://your-app.onrender.com/health
```

### **Test Frontend**
```bash
curl https://your-app.vercel.app
```

---

## **Common Issues & Quick Fixes**

### **"no such table: users"**
```bash
# Check if migrate_db.py is in start command
# Verify DATABASE_URL is set correctly
```

### **CORS Errors**
```bash
# Add frontend domain to ALLOWED_ORIGINS
# Check if using https:// not http://
```

### **Build Fails**
```bash
# Check requirements.txt exists
# Verify Python version compatibility
```

---

## **Useful Commands**

### **Run Deployment Script**
```bash
./deploy.sh
```

### **Check Database Tables**
```bash
# For local SQLite:
sqlite3 startup_investor.db ".tables"

# For PostgreSQL:
psql $DATABASE_URL -c "\dt"
```

### **View Logs**
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Functions tab

---

## **Support**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Detailed Guides**: See `RENDER_DEPLOYMENT.md` and `VERCEL_DEPLOYMENT.md` 