#!/bin/bash

# Deployment script for Startup Investor Platform
# Supports both Render and Vercel deployments

echo "🚀 Startup Investor Platform - Deployment Script"
echo "================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if code is pushed to GitHub
echo "📋 Checking repository status..."
git status --porcelain
if [ $? -eq 0 ]; then
    echo "✅ Repository is clean"
else
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Deployment preparation'"
    echo "   git push"
    exit 1
fi

echo ""
echo "Choose deployment option:"
echo "1. Render (Backend + Database) - RECOMMENDED"
echo "2. Vercel (Frontend only)"
echo "3. Both (Frontend on Vercel + Backend on Render)"
echo "4. Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎯 Render Deployment (Backend + Database)"
        echo "========================================"
        echo ""
        echo "📋 Prerequisites:"
        echo "   - GitHub repository connected to Render"
        echo "   - Render account created"
        echo ""
        echo "🔧 Steps to follow:"
        echo "   1. Go to render.com and sign up"
        echo "   2. Connect your GitHub repository"
        echo "   3. Create new Web Service"
        echo "   4. Set Build Command: pip install -r backend/requirements.txt"
        echo "   5. Set Start Command: cd backend && python3 migrate_db.py && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:\$PORT"
        echo "   6. Create PostgreSQL database"
        echo "   7. Set environment variables:"
        echo "      - DATABASE_URL (from PostgreSQL service)"
        echo "      - SECRET_KEY (generate a strong key)"
        echo "      - ENVIRONMENT=production"
        echo ""
        echo "📖 See RENDER_DEPLOYMENT.md for detailed instructions"
        ;;
    2)
        echo ""
        echo "🎯 Vercel Deployment (Frontend only)"
        echo "===================================="
        echo ""
        echo "📋 Prerequisites:"
        echo "   - Vercel CLI installed: npm install -g vercel"
        echo "   - Backend already deployed (on Render recommended)"
        echo ""
        echo "🔧 Steps to follow:"
        echo "   1. Install Vercel CLI: npm install -g vercel"
        echo "   2. Login to Vercel: vercel login"
        echo "   3. Update frontend API URL to your backend URL"
        echo "   4. Deploy: cd frontend && vercel --prod"
        echo ""
        echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions"
        ;;
    3)
        echo ""
        echo "🎯 Full-Stack Deployment"
        echo "========================"
        echo ""
        echo "📋 Prerequisites:"
        echo "   - GitHub repository"
        echo "   - Render account"
        echo "   - Vercel account"
        echo ""
        echo "🔧 Steps to follow:"
        echo ""
        echo "Step 1: Deploy Backend to Render"
        echo "   - Follow Render deployment guide"
        echo "   - Get your backend URL"
        echo ""
        echo "Step 2: Deploy Frontend to Vercel"
        echo "   - Update frontend API URL"
        echo "   - Deploy with Vercel CLI"
        echo ""
        echo "Step 3: Configure CORS"
        echo "   - Add Vercel domain to Render CORS settings"
        echo ""
        echo "📖 See both RENDER_DEPLOYMENT.md and VERCEL_DEPLOYMENT.md"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please enter 1-4."
        exit 1
        ;;
esac

echo ""
echo "🔗 Useful Links:"
echo "   - Render: https://render.com"
echo "   - Vercel: https://vercel.com"
echo "   - PostgreSQL: https://www.postgresql.org"
echo ""
echo "📚 Documentation:"
echo "   - RENDER_DEPLOYMENT.md"
echo "   - VERCEL_DEPLOYMENT.md"
echo "   - DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!" 