# Deployment Guide - Startup Investor Platform

## Quick Deployment Options

### 1. **Render (Recommended)**
```bash
# 1. Connect your GitHub repository to Render
# 2. Create a new Web Service
# 3. Set environment variables:
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-super-secret-key
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com

# 4. Build Command:
pip install -r requirements.txt

# 5. Start Command:
python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

### 2. **Railway**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy
railway login
railway init
railway up

# 3. Set environment variables in Railway dashboard
```

### 3. **Heroku**
```bash
# 1. Install Heroku CLI
# 2. Create Procfile:
web: python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT

# 3. Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY=your-secret-key
git push heroku main
```

### 4. **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t startup-investor .
docker run -p 8000:8000 -e DATABASE_URL=your-db-url startup-investor
```

## Environment Variables

### Required for Production:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ENVIRONMENT=production
```

### Optional:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Database Setup

### PostgreSQL (Production)
1. Create a PostgreSQL database
2. Set `DATABASE_URL` environment variable
3. Run migration: `python3 migrate_db.py`

### SQLite (Development)
- Automatically created when `DATABASE_URL` is not set
- File: `startup_investor.db`

## Common Issues & Solutions

### 1. **"no such table: users" Error**
**Solution**: Run database migration
```bash
python3 migrate_db.py
```

### 2. **CORS Errors**
**Solution**: Set proper `ALLOWED_ORIGINS`
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. **Database Connection Issues**
**Solution**: Check `DATABASE_URL` format
```
# Correct format:
postgresql://username:password@host:port/database

# For Render:
postgresql://user:password@host/database
```

### 4. **File Upload Issues**
**Solution**: Ensure upload directories exist
```bash
mkdir -p uploads/pitch_decks uploads/profile_photos
```

## Performance Optimization

### 1. **Database Connection Pooling**
- Already configured in `Database/db.py`
- Pool size: 4 workers
- Connection recycling: 300 seconds

### 2. **Static File Serving**
- Files served from `/uploads` endpoint
- Configure CDN for production

### 3. **Caching**
- Consider adding Redis for session storage
- Implement response caching for static data

## Security Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database SSL
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up monitoring/logging

## Monitoring

### Health Check Endpoint
```bash
GET /health
```

### Debug Information
```bash
GET /debug
```

## Support

For deployment issues:
1. Check logs: `heroku logs --tail` or platform equivalent
2. Verify environment variables
3. Test database connection
4. Check CORS configuration 