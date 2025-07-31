# ✅ Deployment Checklist

## **Before You Start**
- [ ] Code is working locally
- [ ] Git repository is ready
- [ ] All files are committed and pushed

---

## **🚀 Render Deployment (Backend)**

### **Step 1: GitHub** ✅
- [ ] Go to GitHub
- [ ] Push your latest code
- [ ] Copy repository URL

### **Step 2: Render Setup** ✅
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect your repository

### **Step 3: Configure Service** ✅
- [ ] **Name**: `startup-investor-api`
- [ ] **Build Command**: `pip install -r backend/requirements.txt`
- [ ] **Start Command**: `cd backend && python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### **Step 4: Add Database** ✅
- [ ] Click "New +" → "PostgreSQL"
- [ ] Name: `startup-investor-db`
- [ ] Copy the `DATABASE_URL`

### **Step 5: Environment Variables** ✅
- [ ] `DATABASE_URL` = (from PostgreSQL)
- [ ] `SECRET_KEY` = `my-super-secret-key-123456789`
- [ ] `ENVIRONMENT` = `production`

### **Step 6: Deploy** ✅
- [ ] Click "Create Web Service"
- [ ] Wait 2-3 minutes
- [ ] Check logs for success

### **Step 7: Test** ✅
- [ ] Visit your Render URL
- [ ] Test `/health` endpoint
- [ ] Check if API responds

---

## **🎨 Vercel Deployment (Frontend)**

### **Step 1: Install Vercel** ✅
- [ ] `npm install -g vercel`
- [ ] `vercel login`

### **Step 2: Update API URL** ✅
- [ ] Change frontend API URL to your Render URL
- [ ] Replace `localhost:8000` with your Render URL

### **Step 3: Deploy Frontend** ✅
- [ ] `cd frontend`
- [ ] `vercel --prod`
- [ ] Copy the Vercel URL

### **Step 4: Configure CORS** ✅
- [ ] Go back to Render
- [ ] Add Vercel URL to `ALLOWED_ORIGINS`
- [ ] Redeploy if needed

---

## **🎯 Final Testing**

### **Backend Tests** ✅
- [ ] `curl https://your-app.onrender.com/health`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test profile creation

### **Frontend Tests** ✅
- [ ] Visit your Vercel URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test profile creation

### **Integration Tests** ✅
- [ ] Frontend can connect to backend
- [ ] File uploads work
- [ ] Database operations work
- [ ] All features functional

---

## **🚨 Common Issues & Fixes**

| Issue | Fix |
|-------|-----|
| "no such table: users" | Check start command has `migrate_db.py` |
| "Build failed" | Check `requirements.txt` exists |
| "CORS error" | Add frontend URL to `ALLOWED_ORIGINS` |
| "Database connection failed" | Check `DATABASE_URL` format |
| "Module not found" | Check Python imports |

---

## **📞 Need Help?**

### **Quick Commands**
```bash
# Check deployment status
./deploy.sh

# View logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions

# Test API
curl https://your-app.onrender.com/health
```

### **Useful URLs**
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your API**: `https://your-app.onrender.com`
- **Your Frontend**: `https://your-app.vercel.app`

---

## **🎉 Success!**

If you've checked all boxes above, congratulations! Your Startup Investor Platform is now live on the internet! 🚀

**Your URLs:**
- **Backend API**: `https://your-app.onrender.com`
- **Frontend App**: `https://your-app.vercel.app`

**Next Steps:**
- [ ] Share your app with users
- [ ] Monitor performance
- [ ] Set up custom domain (optional)
- [ ] Configure backups
- [ ] Set up monitoring 